DROP ROLE 'tour_manager';
DROP ROLE 'tour_developer';
DROP ROLE 'tour_admin';

CREATE ROLE 'tour_manager', 'tour_developer', 'tour_admin';

-- admin role --
GRANT ALL ON tourguide.* TO 'admin';

-- developer role --
GRANT SELECT ON tourguide.* TO 'developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.guide TO 'developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.place TO 'developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.schedule TO 'developer';
GRANT INSERT, UPDATE, DELETE ON tourguide.tour TO 'developer';
GRANT DELETE ON tourguide.guide_rating TO 'developer';
GRANT DELETE ON tourguide.tour_rating TO 'developer';
GRANT EXECUTE, ALTER ROUTINE ON PROCEDURE CalculateRating TO 'developer';
GRANT EXECUTE, ALTER ROUTINE ON FUNCTION DeleteOldCustomers TO 'developer';
GRANT EXECUTE, ALTER ROUTINE ON PROCEDURE PaginateSort TO 'developer';
GRANT EXECUTE, ALTER ROUTINE ON PROCEDURE ScheduleBetweenDates TO 'developer';
GRANT SELECT, ALTER ON tourguide.guide_rating_view TO 'developer';
GRANT SELECT, ALTER ON tourguide.tour_place_schedule TO 'developer';
GRANT SELECT, ALTER ON tourguide.tour_rating_view TO 'developer';

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
GRANT 'developer' TO 'first_developer';
GRANT 'admin' TO 'first_admin';