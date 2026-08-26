export default function manifest() {
  return {
    name: "Efes",
    short_name: "Efes",
    description: "İkimize ait sıcak, nostaljik ve canlı bir hatıra defteri.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0d0c",
    theme_color: "#0f0d0c",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
