
import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, output } from '@angular/core';

declare var SignaturePad: any;

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  
  signatureNeeded = output<void>();
  
  private signaturePad: any;

  ngAfterViewInit() {
    const canvas = this.canvasEl.nativeElement;
    // Set canvas dimensions based on container
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);
    
    this.signaturePad = new SignaturePad(canvas, {
        penColor: 'rgb(0, 0, 100)'
    });

    this.signaturePad.addEventListener("endStroke", () => {
        this.signatureNeeded.emit();
    });
  }
  
  clear() {
    this.signaturePad.clear();
    this.signatureNeeded.emit();
  }

  isEmpty(): boolean {
      return this.signaturePad.isEmpty();
  }

  toDataURL(): string {
    return this.signaturePad.toDataURL(); // a base64 encoded PNG
  }
}
