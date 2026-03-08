import { readFileByPath } from "./fileSystem";
const images: Record<string, HTMLImageElement|HTMLCanvasElement> = {}
export const urls: Record<string, string> = {}
export const loadImageFromPath = (path: string) => {
	if (images[path]) return images[path]
	return new Promise<HTMLImageElement>(async (res) => {
		const content = await readFileByPath(path);
		const blob = new Blob([content], { type: "image/png" });
		const img = new Image();
		const url = URL.createObjectURL(blob)
		img.src = url
		img.onload = () => {
			images[path] = img
			urls[path] = url
			res(img)
		};
	});
};
export const overwriteImage = (path:string,img:HTMLCanvasElement)=>{
	images[path] = img
	urls[path] = img.toDataURL()
}
