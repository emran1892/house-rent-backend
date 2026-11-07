import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBuildingsAndUnits1792955158955 implements MigrationInterface {
    name = 'CreateBuildingsAndUnits1792955158955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "buildings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "address" text NOT NULL, "slug" character varying(150) NOT NULL, "floors_count" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_31caa67e48c6f036ecdc308bb3b" UNIQUE ("slug"), CONSTRAINT "PK_bc65c1acce268c383e41a69003a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."units_status_enum" AS ENUM('VACANT', 'BOOKED', 'OCCUPIED')`);
        await queryRunner.query(`CREATE TABLE "units" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, "building_id" uuid NOT NULL, "code" character varying(50) NOT NULL, "floor" integer NOT NULL, "bedrooms" integer NOT NULL DEFAULT '1', "bathrooms" integer NOT NULL DEFAULT '1', "size_sqft" numeric(8,2), "base_rent" numeric(12,2) NOT NULL, "advance_amount" numeric(12,2) NOT NULL DEFAULT '0', "status" "public"."units_status_enum" NOT NULL DEFAULT 'VACANT', "facilities" text array NOT NULL DEFAULT '{}', "photos" text array NOT NULL DEFAULT '{}', "is_listed" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5a8f2f064919b587d93936cb223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e87179fd7ea2c76e396d81881" ON "units"  ("building_id", "status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cf31dc3699cdc994abe9d7d402" ON "units"  ("building_id", "code") `);
        await queryRunner.query(`ALTER TABLE "buildings" ADD CONSTRAINT "FK_5ab0dc33dfd1ac91b80f954ae90" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "units" ADD CONSTRAINT "FK_477b8c9890c6a2f692c2e1f78ca" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "units" ADD CONSTRAINT "FK_173b4aee6c28c4db7e929760d80" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "units" DROP CONSTRAINT "FK_173b4aee6c28c4db7e929760d80"`);
        await queryRunner.query(`ALTER TABLE "units" DROP CONSTRAINT "FK_477b8c9890c6a2f692c2e1f78ca"`);
        await queryRunner.query(`ALTER TABLE "buildings" DROP CONSTRAINT "FK_5ab0dc33dfd1ac91b80f954ae90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf31dc3699cdc994abe9d7d402"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e87179fd7ea2c76e396d81881"`);
        await queryRunner.query(`DROP TABLE "units"`);
        await queryRunner.query(`DROP TYPE "public"."units_status_enum"`);
        await queryRunner.query(`DROP TABLE "buildings"`);
    }

}
