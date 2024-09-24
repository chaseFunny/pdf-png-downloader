import cors from "cors";
import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("面试刷题，我只用面试鸭~");
});

app.post("/download", async (req, res) => {
  const { url, quality, format, filename, domId, type } = req.body;

  if (!url || !filename || !domId || !type) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    // 启动浏览器
    const browser = await puppeteer.launch();
    // 新建一个页面
    const page = await browser.newPage();
    // 设置默认一分钟超时
    await page.setDefaultNavigationTimeout(60000);
    // 打开页面
    await page.goto(url, { waitUntil: "networkidle0" });

    if (type === "png") {
      // 等待元素加载
      await page.waitForSelector(`#${domId}`);

      // 等待元素加载
      await page.waitForSelector(`#${domId}`);

      // 截取指定元素的截图
      const element = await page.$(`#${domId}`);
      console.log(element, "element");

      const imageBuffer = await element.screenshot({
        type: "jpeg",
        quality: parseInt(quality), // 仅适用于 jpeg
        // omitBackground: true,
      });
      await browser.close();
      res.contentType("image/jpeg");
      res.attachment(filename + ".jpeg");
      // 返回二进制数据给前端
      res.send(Buffer.from(imageBuffer, "binary"));
    } else if (type === "pdf") {
      const pdf = await page.pdf({
        format: format || "A4",
        printBackground: true,
        pageRanges: "1-" + (req.body.pages || "1"),
      });
      res.contentType("application/pdf");
      res.attachment("resume.pdf");
      // 返回二进制数据给前端
      res.send(Buffer.from(pdf));
    } else {
      res.status(400).send("Invalid type");
    }

    await browser.close();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
