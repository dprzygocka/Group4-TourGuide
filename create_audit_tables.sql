create table booking_audit(
booking_audit_id int NOT NULL AUTO_INCREMENT, 
customer_id int NOT NULL,
schedule_id int NOT NULL,
column_name varchar(255),
new_value varchar(255),
action_type varchar(255),
done_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
made_by varchar(255),
PRIMARY KEY (booking_audit_id));

create table tour_audit(
tour_audit_id int NOT NULL AUTO_INCREMENT, 
tour_id int NOT NULL,
column_name varchar(255),
new_value varchar(255),
action_type varchar(255),
done_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
made_by varchar(255),
PRIMARY KEY (tour_audit_id));