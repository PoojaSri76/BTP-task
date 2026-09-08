using { employee.onboarding as db } from '../db/schema';

service OnboardingService {
    entity Employees as projection on db.Employees;
    entity Documents as projection on db.Documents;
}