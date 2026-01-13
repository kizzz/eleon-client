import { Injectable } from "@angular/core";
import html2canvas from "html2canvas";
import { from, Observable, of } from "rxjs";

export interface CropDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScreenCapturePatches {
  hideChatOverlay: boolean;
}

const patch = (patches: ScreenCapturePatches): string[] => {
  let res = ["screen-capture-patch", "hide-capture-overlay"];
  if (patches.hideChatOverlay) {
    res.push("hide-chat-overlay");
  }

  return res;
};

@Injectable({
  providedIn: "root",
})
export class NgxCaptureService {
  public getImage(
    screen: HTMLElement,
    fullCapture?: boolean,
    cropDimensions?: CropDimensions
  ): Observable<string> {
    let options = {
      logging: false,
      useCORS: true,
      onclone: (doc) => {
        this.addPatch(doc.body, patch({ hideChatOverlay: true }));
        this.wrapTextInSpan(doc.body);
      },
    };

    if (
      !fullCapture &&
      cropDimensions.width > 10 &&
      cropDimensions.height > 10
    ) {
      options = { ...options, ...cropDimensions };
    } else if (!fullCapture) {
      return of(null);
    }

    return from(
      html2canvas(screen, options)
        .then(
          (canv) => {
            const img = canv.toDataURL("image/png");
            return img;
          },
          (err) => {
            throw new Error(err);
          }
        )
        .catch((res) => {
          throw new Error(res);
        })
    );
  }

  private addPatch(el: Element, patches: string[]): string[] {
    el.classList.add(...patches);
    return patches;
  }

  private removePatch(el: Element, patches: string[]): void {
    el.classList.remove(...patches);
  }

  private wrapTextInSpan(element: HTMLElement) {
    // Get all descendant nodes of the element
    const nodes = element.getElementsByTagName("*");

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Check if the node has justify-content: space-between
      const style = window.getComputedStyle(node);
      if (style.justifyContent === "space-between") {
        let onlyTextOrComment = true;

        // Check if the node only contains text nodes or comment nodes
        for (let j = 0; j < node.childNodes.length; j++) {
          const childNode = node.childNodes[j];
          if (
            childNode.nodeType !== Node.TEXT_NODE &&
            childNode.nodeType !== Node.COMMENT_NODE
          ) {
            onlyTextOrComment = false;
            break;
          }
        }

        // If the node only contains text nodes or comment nodes, wrap the inner text in a <span></span>
        if (onlyTextOrComment) {
          node.innerHTML = `<span>${node.textContent}</span>`;
        }
      }
    }
  }
}
