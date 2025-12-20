-- Fix existing absences to start in the MORNING (Full Day assumption implies Start=MORNING, End=AFTERNOON)
UPDATE absence SET start_period = 'MORNING';
