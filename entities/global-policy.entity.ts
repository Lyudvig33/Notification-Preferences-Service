import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('global_policies')
@Unique(['notificationType', 'channel', 'region'])
export class GlobalPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_type' })
  notificationType: string;

  @Column()
  channel: string;

  @Column()
  region: string;

  @Column({ default: 'deny' })
  action: string;

  @Column({ default: true })
  active: boolean;
}
