import cors from "cors";
import express from "express";
import { Cluster } from "puppeteer-cluster";

const app = express();
app.use(cors());
app.use(express.json());

let cluster;

// 初始化 cluster
async function initCluster() {
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2, // 最大并发数,可以根据服务器资源调整
    puppeteerOptions: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // 定义任务处理函数
  await cluster.task(async ({ page, data: { url, domId, type, quality, format, pages } }) => {
    await page.goto(url, { waitUntil: "networkidle0" });

    if (type === "png") {
      await page.waitForSelector(`#${domId}`);
      const element = await page.$(`#${domId}`);
      return await element.screenshot({
        type: "jpeg",
        quality: parseInt(quality),
      });
    } else if (type === "pdf") {
      return await page.pdf({
        format: format || "A4",
        printBackground: true,
        pageRanges: "1-" + (pages || "1"),
      });
    }
  });

  console.log("Cluster initialized");
}

initCluster();

app.get("/", (req, res) => {
  res.send("面试刷题，我只用面试鸭~");
});

app.post("/download", async (req, res) => {
  const { url, quality, format, filename, domId, type, pages } = req.body;

  if (!url || !filename || !domId || !type) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const result = await cluster.execute({ url, domId, type, quality, format, pages });

    if (type === "png") {
      res.contentType("image/png");
      res.attachment(filename + ".png");
      res.send(Buffer.from(result));
    } else if (type === "pdf") {
      res.contentType("application/pdf");
      res.attachment(filename + ".pdf");
      res.send(Buffer.from(result));
    } else {
      res.status(400).send("Invalid type");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 优雅关闭
process.on("SIGINT", async () => {
  console.log("Closing cluster...");
  await cluster.close();
  process.exit(0);
});
