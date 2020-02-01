import {
  Component,
  Input,
  Renderer2,
  ElementRef,
  OnInit,
  OnChanges,
  NgZone
} from '@angular/core';

declare var Viz: any;

export interface DotInfo {
  dot: string;
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tw-dot',
  template: ``
})
export class DotComponent implements OnChanges {
  public _dotElem: any;

  @Input()
  public dot: DotInfo;

  public constructor(
    public renderer: Renderer2,
    public el: ElementRef,
    public zone: NgZone
  ) { }

  public ngOnChanges(): void {
    if (this._dotElem) {
      this.renderer.removeChild(this.el.nativeElement, this._dotElem);
    }

    this.createViz();
  }

  public createViz(): void {
    this.zone.runOutsideAngular(() => {
      const viz = new Viz();
      viz.renderSVGElement(this.dot.dot)
        .then((element: any) => {
          this._dotElem = element;
          this._dotElem.width.baseVal.valueAsString = '100%';
          this.renderer.appendChild(this.el.nativeElement, this._dotElem);
        });
      // viz.renderImageElement(this.dot.dot)
      //   .then((element: any) => {
      //     this._dotElem = element;
      //     this.renderer.appendChild(this.el.nativeElement, this._dotElem);
      //   });
    });
  }
}
