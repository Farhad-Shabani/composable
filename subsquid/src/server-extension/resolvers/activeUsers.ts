import {
  Arg,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import type { EntityManager } from "typeorm";
import { IsDateString, Min } from "class-validator";
import { Activity } from "../../model";

@ObjectType()
export class ActiveUsers {
  @Field(() => String, { nullable: false })
  date!: string;

  @Field(() => Number, { nullable: false })
  count!: number;

  constructor(props: Partial<ActiveUsers>) {
    Object.assign(this, props);
  }
}

@InputType()
export class ActiveUsersInput {
  @Field(() => Int, { nullable: false })
  @Min(1)
  intervalMinutes!: number;

  @Field(() => String, { nullable: true })
  @IsDateString()
  dateFrom?: string;

  @Field(() => String, { nullable: true })
  @IsDateString()
  dateTo?: string;
}

@Resolver()
export class ActiveUsersResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [ActiveUsers])
  async activeUsers(
    @Arg("params", { validate: true }) input: ActiveUsersInput
  ): Promise<ActiveUsers[]> {
    const intervalMilliseconds = input.intervalMinutes * 60 * 1000;
    const params: any[] = [intervalMilliseconds];
    const where: string[] = [];
    let from: number;

    // Set "from" filter
    if (input.dateFrom) {
      from = new Date(input.dateFrom).valueOf();
    } else {
      const date = new Date();
      // TODO: define default date
      date.setDate(date.getDate() - 7);
      from = date.valueOf();
    }
    from = Math.floor(from / intervalMilliseconds) * intervalMilliseconds;
    where.push(`timestamp > $${params.push(from)}`);

    // Set "to" filter
    if (input.dateTo) {
      let to = new Date(input.dateTo).valueOf();
      to = Math.ceil(to / intervalMilliseconds) * intervalMilliseconds;
      where.push(`timestamp < $${params.push(to)}`);
    }

    const manager = await this.tx();

    let rows: { period: string; count: string }[] = await manager
      .getRepository(Activity)
      .query(
        `
            SELECT
              round(timestamp / $1) * $1 as period,
              count(distinct account_id) as count
            FROM activity
            WHERE ${where.join(" AND ")}
            GROUP BY period
            ORDER BY period DESC
        `,
        params
      );

    return rows.map(
      (row) =>
        new ActiveUsers({
          date: new Date(parseInt(row.period, 10)).toISOString(),
          count: Number(row.count),
        })
    );
  }
}
