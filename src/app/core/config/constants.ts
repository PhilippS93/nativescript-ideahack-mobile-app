export class Config {

    static wasteColor(waste): string {
        switch (waste) {
            case "GREEN":
                return "green";
            case "YELLOW":
                return "#fff300";
            case "BLACK":
                return "#02556E";
            case "BLUE":
                return "#3A53FF";
            default:
                return "#02556E";
        }
    }

}
