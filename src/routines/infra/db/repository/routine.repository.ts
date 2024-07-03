import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { IRoutineRepository } from '@/routines/domain/iroutine.repository';
import { Routine } from '@/routines/domain/routine.model';
import { RoutineEntity } from '@/routines/infra/db/entity/routine.entity';
import { RoutineToTimerEntity } from '@/routines/infra/db/entity/routine-to-timer.entity';
import { entityFormatter } from '@/utils/entity-formatter.util';

@Injectable()
export class RoutineRepository implements IRoutineRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(RoutineEntity)
    private routineRepository: Repository<RoutineEntity>,
    @InjectRepository(RoutineToTimerEntity)
    private routineToTimerRepository: Repository<RoutineToTimerEntity>
  ) {}
  // TODO: 리턴 타입 수정
  async fetchRoutine(id: string): Promise<any> {
    // TODO: 불필요한 데이터는 리턴하지 않도록 수정
    // TODO: 쿼리결과 order by 'order'
    const routineEntity = await this.routineRepository.find({
      where: { userId: id },
      relations: {
        user: false,
        routineToTimer: {
          timer: true,
          // TODO: 순환 쿼리 방지하도록 엔티티 수정
          routine: false,
        },
      },
    });

    // Using query builder
    // const routineEntity = await this.dataSource.manager
    //   .createQueryBuilder(RoutineEntity, 'Routine')
    //   .leftJoinAndSelect('Routine.routineToFrag', 'routineToFrag')
    //   .getMany();

    if (!routineEntity) {
      return null;
    }

    return routineEntity;
  }

  async saveRoutine(userId: string, routine: Routine): Promise<any> {
    try {
      await this.dataSource.transaction(async (manager) => {
        // TODO: 불필요한 프로퍼티 생성 최소화
        // TODO: Mapper 활용하여 내부 데이터 id -> timerId 수행
        const { formatResult } = entityFormatter([routine], '_', {
          userId: userId,
          routineToTimerId: 'ulid',
        });
        const result = RoutineEntity.create(formatResult[0]);

        // 기존에 DB에 저장되어있는 같은 routineId 관련 정보 제거
        await this.routineToTimerRepository.delete({ routineId: routine.id });
        await manager.save(result);
      });
    } catch (err) {
      throw new Error(err);
    }

    return { success: true };
  }

  async removeRoutine(routineId: string): Promise<any> {
    try {
      await this.dataSource.transaction(async () => {
        // const entities = await this.routineRepository.findBy({ id: routineId });
        // await this.routineRepository.remove(entities);
        const routine = await this.routineRepository.findBy({ id: routineId });
        const relations = await this.routineToTimerRepository.findBy({
          routineId: routineId,
        });

        await this.routineToTimerRepository.remove(relations);
        await this.routineRepository.remove(routine);
      });
    } catch (err) {
      throw new Error(err);
    }

    return { success: true };
  }
}
