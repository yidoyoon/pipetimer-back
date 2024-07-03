import { plainToClass } from 'class-transformer';

import { Timer } from '@/timers/domain/timer.model';

export class Routine {
  id: string;
  name: string;
  count: number;
  data: Timer[];
  isEditing: boolean;

  constructor(routine: Partial<Routine>) {
    if (routine) {
      Object.assign(
        this,
        plainToClass(Routine, routine, {
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
  // get count(): number {
  //   return this._count;
  // }
  //
  // set count(value: number) {
  //   this._count = value;
  // }
  //
  // get data(): Frag[] {
  //   return this._data;
  // }
  //
  // set data(value: Frag[]) {
  //   this._data = value;
  // }
  //
  // get isEditing(): boolean {
  //   return this._isEditing;
  // }
  //
  // set isEditing(value: boolean) {
  //   this._isEditing = value;
  // }
}
