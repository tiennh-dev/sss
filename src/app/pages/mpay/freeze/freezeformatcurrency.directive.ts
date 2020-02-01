import { Directive, OnInit, forwardRef, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { DecimalPipe } from '@angular/common';
 
@Directive({
  selector: '[usd-only]'
})
export class FreeZeFormatCurrencyDirective implements OnInit {
  currencyChars = new RegExp('[\.,]', 'g');  

  constructor(public el: ElementRef, public renderer: Renderer2, private decimalPipe: DecimalPipe) {}

  ngOnInit() {
  }

  @HostListener('input', ["$event.target.value"]) onInput(e: string) {
    this.format(e);
  };

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    this.format(event.clipboardData.getData('text/plain'));
  }

  format(val:string) {
    const numberFormat = parseInt(String(val).replace(this.currencyChars, ''));

    const usd = this.decimalPipe.transform(numberFormat, '1.0', 'en-US');

   this.renderer.setProperty(this.el.nativeElement, 'value', usd);
  }

}