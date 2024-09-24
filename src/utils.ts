import { message } from "antd";
import domtoimage from "dom-to-image";
import html2canvas from "html2canvas";

/**
 * 下载 dom 元素为图片
 * @param elementId DOM 元素id
 * @param fileName 下载图片的文件名
 * @returns
 */
export const downloadDOMElementAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId) as HTMLElement;
  if (!element) return message.error("无法找到 DOM 元素");
  try {
    // 将 DOM 元素转换为 canvas
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      // 提高清晰度
      scale: 2,
      backgroundColor: "transparent",
    });
    // 将 canvas 转换为数据 URL
    const dataUrl = canvas.toDataURL("image/png");
    // 创建一个临时的 <a> 元素，设置其 href 为数据 URL 并设置 download 属性
    const link = document.createElement("a");
    link.style.visibility = "hidden";
    link.href = dataUrl;
    link.download = fileName;

    // 将 <a> 元素添加到 DOM，触发点击事件，然后从 DOM 中移除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error: AnyIfEmpty<unknown>) {
    message.error("无法将 DOM 元素转换为图片并下载", error);
  }
  element.style.transform = "scale(1)";
};

/**
 * 下载 DOM 元素为高质量图片
 * @param elementId DOM 元素id
 * @param fileName 下载图片的文件名
 * @param sc 缩放比
 * @returns
 */
export const downloadDOMElementAsImageWithDomToImage = async (elementId: string, fileName: string, sc = 3) => {
  const element = document.getElementById(elementId) as HTMLElement;
  if (!element || !window || !document) return message.warning("无法找到 DOM 元素");
  const messageKey = "loading";
  message.loading({
    content: "正在下载...",
    duration: 0,
    key: messageKey,
  });
  try {
    const clone = element.cloneNode(true) as HTMLElement;
    console.log(clone, " clone");

    document.body.appendChild(clone);
    // 临时增加元素尺寸以提高分辨率
    const originalWidth = element.offsetWidth;
    const originalHeight = element.offsetHeight;
    const scale = sc; // 增加缩放因子以提高分辨率

    // 设置相对定位，zIndex 为 -1
    clone.style.position = "relative";
    // clone.style.zIndex = "-1";
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = "top left";
    console.log(domtoimage, clone, " domtoimage");

    const dataUrl = await domtoimage.toPng(clone, {
      width: originalWidth * scale,
      height: originalHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${originalWidth}px`,
        height: `${originalHeight}px`,
      },
      cacheBust: true,
      quality: 1,
      // bgcolor: "transparent",
    });
    console.log(dataUrl, " dataUrl");

    // 创建下载链接
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.destroy(messageKey);
    setTimeout(() => {
      document.body.removeChild(clone);
    }, 500);
  } catch (e: AnyIfEmpty<unknown>) {
    message.destroy(messageKey);
    console.error("下载失败", e.message);
    message.error("下载失败: " + e.message);
  }
};
