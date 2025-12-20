CREATE INDEX "bug_report_created_at_idx" ON "bug_report" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bug_report_severity_idx" ON "bug_report" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "bug_report_status_idx" ON "bug_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_submission_created_at_idx" ON "contact_submission" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_log_status_idx" ON "email_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_log_sent_at_idx" ON "email_log" USING btree ("sent_at");