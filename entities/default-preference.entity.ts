import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('default_preferences')
@Unique(['notificationType', 'channel'])
export class DefaultPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_type' })
  notificationType: string;

  @Column()
  channel: string;

  @Column()
  enabled: boolean;
}
