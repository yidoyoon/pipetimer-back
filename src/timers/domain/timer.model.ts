import { plainToClass } from 'class-transformer';

export class Timer {
  timerId: string;
  name: string;
  duration: number;
  count: number;
  order: number;
  color: string;

  constructor(timer: Partial<Timer>) {
    if (timer) {
      Object.assign(
        this,
        plainToClass(Timer, timer, {
          excludeExtraneousValues: false,
        })
      );
    }
  }

  // get id(): string {
  //   return this._id;
  // }
  //
  // set id(value: string) {
  //   this._id = value;
  // }
  //
  // get name(): string {
  //   return this._name;
  // }
  //
  // set name(value: string) {
  //   this._name = value;
  // }
  //
  // get duration(): number {
  //   return this._duration;
  // }
  //
  // set duration(value: number) {
  //   this._duration = value;
  // }
  //
  // get count(): number {
  //   return this._count;
  // }
  //
  // set count(value: number) {
  //   this._count = value;
  // }
  //
  // get color(): string {
  //   return this._color;
  // }
  //
  // set color(value: string) {
  //   this._color = value;
  // }
}
