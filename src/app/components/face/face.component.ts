import { Component, OnInit, AfterViewInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css']
})
export class FaceComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('timer-radius') timerRadius: number;
  @ViewChild('face') faceCanvas: ElementRef;
  private context: CanvasRenderingContext2D;
  private faceProportion: number = 0.8;
  private secondProportion: number = 0.5;
  private timer$: Subscription;
  private isRunning: boolean;
  private running$: Subscription;

  constructor(private timer: TimerService) {
    this.isRunning = false;
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.context = (<HTMLCanvasElement>this.faceCanvas.nativeElement).getContext('2d');
    this.context.translate(this.timerRadius, this.timerRadius);

    this.running$ = this.timer.state().subscribe(v => {
      this, this.isRunning = v;
    });
    this.timer$ = this.timer.register().subscribe(v => {
      this.drawTimer(this.context, v);
    });
  }

  ngOnDestroy() {
    if (this.timer$) {
      this.timer$.unsubscribe();
    }
    if (this.running$) {
      this.running$.unsubscribe();
    }
  }

  drawTimer(cx: CanvasRenderingContext2D, second: number) {
    this.clearCanvas(cx);
    this.drawTime(cx, second, this.timer.getInitialTime());
    if (this.isRunning && second <= 60) {
      this.drawLastMinute(cx, second);
    }
    this.drawTimeText(cx, second);
    this.drawFace(this.context);
    this.drawBranding(this.context);
  }

  clearCanvas(cx: CanvasRenderingContext2D) {
    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
    cx.restore();
  }

  drawBranding(cx: CanvasRenderingContext2D) {
    const fontSize: number = Math.round(this.timerRadius * 0.05);
    const fontOffset: number = (this.timerRadius * 0.3) + fontSize;

    cx.moveTo(0, 0);
    cx.font = `${fontSize}px Arial`;
    cx.textAlign = 'center';
    cx.textBaseline = 'bottom';
    cx.fillText(`BAYO's Timer`, 0, - fontOffset);
  }

  drawFace(cx: CanvasRenderingContext2D) {
    this.drawMinute(cx);
    this.drawHour(cx);
    this.drawPin(cx);
    this.drawNumbers(cx);
  }

  drawTime(cx: CanvasRenderingContext2D, second: number, initial: number) {
    const from: number = -0.5 * Math.PI;
    const to: number = from - (2 * Math.PI) * (second / 3600);
    const toInitial: number = from - (2 * Math.PI) * (initial / 3600);

    // draw initial time
    cx.beginPath();
    cx.lineCap = 'butt';
    cx.lineWidth = this.timerRadius * this.faceProportion;
    cx.strokeStyle = '#ddd';
    cx.arc(0, 0, this.timerRadius * this.faceProportion / 2, from, toInitial, true);
    cx.stroke();

    // draw current time
    cx.beginPath();
    cx.lineCap = 'butt';
    cx.lineWidth = this.timerRadius * this.faceProportion;
    cx.strokeStyle = '#fb0000';
    cx.arc(0, 0, this.timerRadius * this.faceProportion / 2, from, to, true);
    cx.stroke();
  }

  drawLastMinute(cx: CanvasRenderingContext2D, second: number) {
    const from: number = -0.5 * Math.PI;
    const to: number = from - (2 * Math.PI) * (second / 60);

    cx.beginPath();
    cx.lineCap = 'butt';
    cx.lineWidth = this.timerRadius * this.secondProportion;
    cx.strokeStyle = '#c70000';
    cx.arc(0, 0, this.timerRadius * this.secondProportion / 2, from, to, true);
    cx.stroke();
  }

  drawTimeText(cx: CanvasRenderingContext2D, second: number) {
    const fontSize: number = Math.round(this.timerRadius * 0.2);
    const fontOffset: number = (this.timerRadius * 0.15) + fontSize;
    const timeTick: string = this.secondToTime(second);

    cx.moveTo(0, 0);
    cx.font = `${fontSize}px Arial`;
    cx.textAlign = 'center';
    cx.textBaseline = 'bottom';
    cx.fillText(`${timeTick}`, 0, fontOffset);
  }

  drawNumbers(cx: CanvasRenderingContext2D) {
    const fontSize: number = Math.round(this.timerRadius * 0.1);

    cx.font = `${fontSize}px Arial`;
    cx.textBaseline = 'middle';
    cx.textAlign = 'center';
    for (let num = 0; num < 12; num++) {
      const angle = -num * Math.PI / 6;
      cx.rotate(angle);
      cx.translate(0, -this.timerRadius * 0.9);
      cx.rotate(-angle);
      cx.fillText((num * 5).toString(), 0, 0);
      cx.rotate(angle);
      cx.translate(0, this.timerRadius * 0.9);
      cx.rotate(-angle);
    }
  }

  drawPin(cx: CanvasRenderingContext2D) {
    cx.beginPath();
    cx.arc(0, 0, this.timerRadius * 0.03, 0, 2 * Math.PI);
    cx.fillStyle = '#000';
    cx.fill();
  }

  drawTimeStep(cx: CanvasRenderingContext2D, count: number, lengthToRadius: number, widthToRadius: number) {
    const angle = Math.PI / (count / 2);
    cx.strokeStyle = '#000';
    for (let i = 1; i <= count; i++) {
      cx.beginPath();
      cx.lineWidth = lengthToRadius * this.timerRadius;
      cx.lineCap = 'round';
      cx.moveTo(0, -this.timerRadius * this.faceProportion);
      cx.lineTo(0, -this.timerRadius * (this.faceProportion - widthToRadius));
      cx.stroke();
      cx.rotate(angle);
    }
  }

  drawMinute(cx: CanvasRenderingContext2D) {
    this.drawTimeStep(cx, 60, 0.01, 0.06);
  }

  drawHour(cx: CanvasRenderingContext2D) {
    this.drawTimeStep(cx, 12, 0.02, 0.1);
  }

  secondToTime(second: number): string {
    const min: string = (Math.floor(second / 60)).toString().padStart(2, '0');
    const sec: string = (second % 60).toString().padStart(2, '0');

    const time: string = `${min}:${sec}`;
    return time;
  }

  onTap($event) {
    if ($event.tapCount === 2) {
      this.timer.start();
    }
  }

  onPanUp($event) {
    this.timer.decreaseMinute();
  }

  onPanDown($event) {
    this.timer.increaseMinute();
  }

  onPanLeft($event) {
    this.timer.increaseSecond();
  }

  onPanRight($event) {
    this.timer.decreaseSecond();
  }
}
