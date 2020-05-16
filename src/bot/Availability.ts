export default class Availability 
{
    startDate: string;
    endDate: string;
    workLevel: string;

    constructor(startDate: string, endDate: string, workLevel: string) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.workLevel = workLevel;
    }
}