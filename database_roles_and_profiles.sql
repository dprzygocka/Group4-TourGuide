DROP ROLE IF EXISTS 'tour_manager';
DROP ROLE IF EXISTS 'tour_developer';
DROP ROLE IF EXISTS 'tour_admin';

CREATE ROLE 'tour_manager', 'tour_developer', 'tour_admin';

-- tour_admin role --
GRANT ALL ON tourguide.* TO 'tour_admin';

-- tour_developer role --
GRANT SELECT ON tourguide.* TO 'tour_developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.guide TO 'tour_developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.place TO 'tour_developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.schedule TO 'tour_developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.tour TO 'tour_developer';
GRANT DELETE ON tourguide.guide_rating TO 'tour_developer';
GRANT DELETE ON tourguide.tour_rating TO 'tour_developer';
GRANT EXECUTE, ALTER ROUTINE ON PROCEDURE CalculateRating TO 'tour_developer';
GRANT EXECUTE, ALTER ROUTINE ON FUNCTION DeleteOldCustomers TO 'tour_developer';
GRANT EXECUTE, ALTER ROUTINE ON PROCEDURE PaginateSort TO 'tour_developer';
GRANT EXECUTE, ALTER ROUTINE ON PROCEDURE ScheduleBetweenDates TO 'tour_developer';
GRANT SELECT, ALTER ON tourguide.guide_rating_view TO 'tour_developer';
GRANT SELECT, ALTER ON tourguide.tour_place_schedule TO 'tour_developer';
GRANT SELECT, ALTER ON tourguide.tour_rating_view TO 'tour_developer';

-- tour_manager role --
GRANT SELECT ON tourguide.guide TO 'tour_manager';
GRANT SELECT ON tourguide.place TO 'tour_manager';
GRANT SELECT ON tourguide.schedule TO 'tour_manager';
GRANT SELECT ON tourguide.tour TO 'tour_manager';
GRANT SELECT ON tourguide.booking TO 'tour_manager';
GRANT SELECT ON tourguide.booking_audit TO 'tour_manager';
GRANT SELECT ON tourguide.guide_rating TO 'tour_manager';
GRANT SELECT ON tourguide.tour_audit TO 'tour_manager';
GRANT SELECT ON tourguide.tour_rating TO 'tour_manager';
GRANT SELECT ON tourguide.guide_rating_view TO 'tour_manager';
GRANT SELECT ON tourguide.tour_place_schedule TO 'tour_manager';
GRANT SELECT ON tourguide.tour_rating_view TO 'tour_manager';
GRANT EXECUTE ON PROCEDURE PaginateSort TO 'tour_manager';

-- creaye users --
CREATE USER 'first_manager' identified by 'passwordManager';
CREATE USER 'first_developer' identified by 'passwordDeveloper';
CREATE USER 'first_admin' identified by 'passwordAdmin';

GRANT 'tour_manager' TO 'first_manager';
GRANT 'tour_developer' TO 'first_developer';
GRANT 'admin' TO 'first_admin';