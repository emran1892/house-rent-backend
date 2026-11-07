import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayments1793021270680 implements MigrationInterface {
    name = 'CreatePayments1793021270680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_payment_method_enum" AS ENUM('CASH', 'BKASH', 'NAGAD', 'BANK_TRANSFER', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organization_id" uuid NOT NULL, "invoice_id" uuid NOT NULL, "receipt_number" character varying(50) NOT NULL, "amount" numeric(12,2) NOT NULL, "payment_date" date NOT NULL, "payment_method" "public"."payments_payment_method_enum" NOT NULL DEFAULT 'CASH', "transaction_reference" character varying(100), "note" text, CONSTRAINT "UQ_a6659e5eb1bf3b467c819e7f167" UNIQUE ("receipt_number"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_fc07ace491143726974991711f2" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_563a5e248518c623eebd987d43e" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_563a5e248518c623eebd987d43e"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_fc07ace491143726974991711f2"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_payment_method_enum"`);
    }

}
