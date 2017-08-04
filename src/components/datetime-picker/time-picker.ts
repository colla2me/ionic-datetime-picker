import { Component, ElementRef, ViewChild, QueryList, ViewChildren, Input, Output, EventEmitter } from '@angular/core';
import BScroll from "better-scroll";
import { addClass, removeClass } from "../../providers/dom";

@Component({
  selector: 'time-picker',
  templateUrl: 'time-picker.html'
})
export class TimePicker {
  @ViewChild('pickerEl')
  pickerRef: ElementRef;
  @ViewChild('panelEl')
  panelRef: ElementRef;
  @ViewChildren('wheelEl')
  wheelRef: QueryList<ElementRef>;
  @ViewChildren('scrollEl')
  scrollRef: QueryList<ElementRef>;

  @Output()
  pickerChange: EventEmitter<any> = new EventEmitter();

  @Input()
  options: {data: any[], selectedIndex: any};

  private wheels: BScroll[];
  private pickerEl: HTMLElement;
  private panelEl: HTMLElement;
  private wheelEls: Element[] = [];
  private scrollEls: Element[] = [];
  private selectedIndex = {};
  private data: any[];

  constructor() {
    // 测试数据
    let hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
    let minutes = ['00', '10', '20', '30', '40', '50', '60'];
    this.data = [hours, minutes];
  }

  ngAfterViewInit() {
    this.pickerEl = this.pickerRef.nativeElement;
    this.panelEl = this.panelRef.nativeElement;
    this.wheelRef.forEach(elementRef => {
      this.wheelEls.push(elementRef.nativeElement)
    });
    this.scrollRef.forEach(elementRef => {
      this.scrollEls.push(elementRef.nativeElement)
    });
    this._init();
  }

  _init() {
    for (let i = 0; i < this.data.length; i++) {
      this.selectedIndex[i] = 0;
    }
    this.show();
  }

  _createWheel(wheelEl, i) {
    this.wheels[i] = new BScroll(wheelEl[i], {
      wheel: true,
      probeType: 3,
      selectedIndex: this.selectedIndex[i]
    });

    let offsetY: number;
    const children = this.scrollEls[i].children;
    const length = children.length;
    this.wheels[i].on('scroll', (pos) => {
      for (let j = 0; j < length; j++) {
        let item = children[j];
        offsetY = pos.y + 40 * j;
        if (Math.abs(offsetY) < 200) {
          let currentIndex = Math.max(Math.abs(Math.round(offsetY / 40)), 0);
          if (currentIndex === 0) {
            this.selectedIndex[i] === j;
            addClass(item, 'highlight');
          } else {
            removeClass(item, 'highlight');
          }
        }
      }
    });

    ((index) => {
      this.wheels[index].on('scrollEnd', () => {
        let currentIndex = this.wheels[index].getSelectedIndex();
        if (this.selectedIndex[i] !== currentIndex) {
          this.selectedIndex[i] = currentIndex;
          let result = {
            selectedVal: this.data[index][currentIndex],
            selectedRow: currentIndex,
            columnIndex: index
          }
          this.pickerChange.emit(result);
        }
      });
    })(i);
    return this.wheels[i];
  }

  show() {
    window.setTimeout(() => {
      if (!this.wheels) {
        this.wheels = [];
        for (let i = 0; i < this.data.length; i++) {
          this._createWheel(this.wheelEls, i);
          addClass(this.scrollEls[i].firstElementChild, 'highlight')
        }
      } else {
        for (let i = 0; i < this.data.length; i++) {
          this.wheels[i].enable();
          this.wheels[i].wheelTo(this.selectedIndex[i]);
        }
      }
    }, 0);
  }


  refillColumn(index, data) {
    if (!data || !data.length) return;
    let wheelData = this.data[index] = [];
    this.data[index] = wheelData.concat(data);
    let wheel = this.wheels[index];
    wheel.destroy();
    window.setTimeout(() => {
      wheel = this._createWheel(this.wheelEls, index);
      wheel.enable();
      wheel.refresh();
    }, 0);
  }


  refill(items: any[]) {
    let ret = [];
    if (!items.length) {
      return ret;
    }
    items.forEach((data, index) => {
      ret[index] = this.refillColumn(index, data);
    });
    return ret;
  }

  scrollColumn(column, dist) {
    let wheel = this.wheels[column];
    wheel.wheelTo(dist);
  }
}
