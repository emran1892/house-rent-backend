import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantAndLease1792995798573 implements MigrationInterface {
    name = 'CreateTenantAndLease1792995798573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, "user_id" uuid, "name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(100), "nid_passport" character varying(50), "emergency_contact" character varying(20), "permanent_address" text, CONSTRAINT "REL_0e2bb90ad27fa92910185792ac" UNIQUE ("user_id"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."leases_status_enum" AS ENUM('ACTIVE', 'PENDING', 'TERMINATED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "leases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, "unit_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "start_date" date NOT NULL, "end_date" date, "monthly_rent" numeric(12,2) NOT NULL, "security_deposit" numeric(12,2) NOT NULL DEFAULT '0', "rent_due_day" integer NOT NULL DEFAULT '5', "status" "public"."leases_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_2668e338ab2d27079170ea55ea2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_d416dc819dedd1771134de2fe95" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "FK_0e2bb90ad27fa92910185792aca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leases" ADD CONSTRAINT "FK_1a5969e09d0b01b3ef1de108282" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leases" ADD CONSTRAINT "FK_74490d0e8132cb49ede07d898c7" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leases" ADD CONSTRAINT "FK_b4787e839c9c76e31d5a06aa3c5" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leases" DROP CONSTRAINT "FK_b4787e839c9c76e31d5a06aa3c5"`);
        await queryRunner.query(`ALTER TABLE "leases" DROP CONSTRAINT "FK_74490d0e8132cb49ede07d898c7"`);
        await queryRunner.query(`ALTER TABLE "leases" DROP CONSTRAINT "FK_1a5969e09d0b01b3ef1de108282"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "FK_0e2bb90ad27fa92910185792aca"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "FK_d416dc819dedd1771134de2fe95"`);
        await queryRunner.query(`DROP TABLE "leases"`);
        await queryRunner.query(`DROP TYPE "public"."leases_status_enum"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
    }

}
