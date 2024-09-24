import { DownloadOutlined } from "@ant-design/icons";
import { Button, Divider, Form, InputNumber, Layout, message, Select, Space } from "antd";
import React, { useState } from "react";
import request from "umi-request";
import IconReact from "./assets/react.svg";
import { downloadDOMElementAsImage, downloadDOMElementAsImageWithDomToImage } from "./utils";

const { Content, Sider } = Layout;
const { Option } = Select;
const App: React.FC = () => {
  const [downloadType, setDownloadType] = useState<downloadType>("png");
  const [quality, setQuality] = useState<number>(80);

  const handleDownload = async () => {
    const filename = "test";
    try {
      // const data: AnyIfEmpty<unknown> = await request.get("http://localhost:3010/pdf/getPNG", {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   params: {
      //     url: window.location.href,
      //     secret: SERVER_SECRET,
      //   },
      //   getResponse: true,
      // });
      const data: AnyIfEmpty<undefined> = await request.post("http://127.0.0.1:3001/download", {
        data: {
          url: window.location.href,
          format: "A4",
          filename,
          domId: "download",
          type: downloadType,
          quality,
        },
        getResponse: true,
      });
      console.log(data);
      const blob = await data?.response?.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadType === "pdf" ? filename + ".pdf" : filename + ".png";
      a.click();
      URL.revokeObjectURL(url);
      message.success("下载成功");
    } catch (error: AnyIfEmpty<unknown>) {
      console.log(error.toString(), error.message);

      message.error("下载失败，请重试");
    }
  };

  return (
    <Layout className="resume-show-new" style={{ minHeight: "100vh", width: "100vw" }}>
      <Content style={{ padding: "20px", display: "flex" }}>
        <div
          id="download"
          style={{
            flex: 1,
            marginRight: "20px",
            border: "1px solid #d9d9d9",
            padding: "20px",
            minWidth: "500px",
            minHeight: "400px",
          }}
        >
          <h1>待下载内容</h1>
          <img src={IconReact} alt="示例图片" style={{ maxWidth: "100%", minHeight: 100 }} />
          <p>
            这是一些富文本内容，可以包含<strong>加粗</strong>、<em>斜体</em>等样式。
          </p>
        </div>
        <Sider width={300} style={{ background: "#fff", padding: "20px" }}>
          <Space direction="vertical">
            <Button onClick={() => downloadDOMElementAsImage("download", "html2canvas.png")}>html2canvas 下载</Button>
            <Button
              type="primary"
              onClick={() => downloadDOMElementAsImageWithDomToImage("download", "dom-to-image.png")}
            >
              dom-to-image 下载
            </Button>
          </Space>
          <Divider />
          <Form layout="vertical">
            <Form.Item label="下载类型">
              <Select value={downloadType} onChange={(value: downloadType) => setDownloadType(value)}>
                <Option value="png">PNG</Option>
                {/* <Option value="jpeg">JPEG</Option> */}
                <Option value="pdf">PDF</Option>
              </Select>
            </Form.Item>
            <Form.Item label="质量">
              <InputNumber
                min={1}
                max={100}
                value={quality}
                onChange={(value: number | null) => setQuality(value || 80)}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
                下载
              </Button>
            </Form.Item>
          </Form>
        </Sider>
      </Content>
    </Layout>
  );
};

export default App;
