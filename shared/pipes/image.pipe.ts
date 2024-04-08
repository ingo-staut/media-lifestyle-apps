import { Pipe, PipeTransform } from "@angular/core";
import { TextInput } from "shared/models/dialog-input.type";
import { findLandscapeImage, isImageFilePath } from "shared/utils/image";

@Pipe({
  name: "imageByFormfield",
})
export class ImageByFormfieldPipe implements PipeTransform {
  transform(input: TextInput, value: string | null): string {
    if (!value) return "";
    if (!input.placeholder) return "";

    if (!isImageFilePath(value)) return "";
    return value;
  }
}

@Pipe({
  name: "isImageFile",
})
export class IsImageFilePipe implements PipeTransform {
  transform(image: string): string {
    if (!image) return "";

    if (!isImageFilePath(image)) return "";
    return image;
  }
}

@Pipe({
  name: "headerImage",
})
export class HeaderImagePipe implements PipeTransform {
  async transform(
    images: string[],
    previewImageIfNoHeaderImage: boolean = false
  ): Promise<string | undefined> {
    const landscapeImage = await findLandscapeImage(images);

    // If no landscape image found, return the first image in the array
    if (!landscapeImage && images.length > 0) {
      return previewImageIfNoHeaderImage ? images[0] : undefined;
    }

    return landscapeImage;
  }
}
