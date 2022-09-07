import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export default class WorkflowJob {
  @PrimaryColumn()
  public id: number | undefined

  @Column()
  public repo: string | undefined;
}
