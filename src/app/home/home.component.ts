import { AfterContentInit, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { RouterExtensions } from "nativescript-angular";
import { TrashCanService } from "~/app/services/trash-can.service";

import * as moment from "moment";
import { interval, Subject } from "rxjs";
import { startWith, takeUntil } from "rxjs/internal/operators";

@Component({
    selector: "Home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.scss"]
})
export class HomeComponent implements OnInit, OnDestroy, AfterContentInit {
    loaded: boolean = false;
    bins: any = [];
    _selectedChartIndex: number = 0;
    costChartData = [];
    wasteDistribution = [];
    totalAmount;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _routerExtensions: RouterExtensions,
        private zone: NgZone,
        private trashCanService: TrashCanService
    ) {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        const source = interval(2000);

        const subscribe = source
            .pipe(startWith(0))
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((val) => {
            this.trashCanService.getTrashCans()
                .subscribe((bins) => {
                    this.calculateBinData(bins);
                });
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    ngAfterContentInit(): void {
        setTimeout(() => {
            this.loaded = true;
        });
    }

    selectedChartIndex(index: number) {
        this._selectedChartIndex = index;

        this.calculateForSelection();
    }

    openBin(bin) {
        this.zone.run(() => {
            this._routerExtensions.navigate(["/details"], {
                clearHistory: false,
                animated: true,
                queryParams: {
                    binID: bin.id
                },
                transition: {
                    name: "slideLeft",
                    duration: 350,
                    curve: "ease"
                }
            });
        });
    }

    private calculateForSelection() {
        if (this._selectedChartIndex === 0) {
            // day
            this.wasteDistribution = this.bins.map((bin) => {
                return {type: bin.type, text: bin.text, value: bin.fullness};
            });

            this.bins.forEach((bin) => {
                bin.totalAmount = bin.entries
                    .filter((entry) => this.isToday(new Date(entry.date)))
                    .map((entry) => entry.price)
                    .reduce((acc, curr) => acc + curr);

                bin.totalAmount = bin.totalAmount ? Math.round(bin.totalAmount * 100) / 100 : 0;
            });

            const today = moment();
            const start = today.startOf("day");

            this.costChartData = this.bins
                .map((bin) => bin.entries)
                .reduce((acc, curr) => [...acc, ...curr], [])
                .filter((entry) => this.isToday(new Date(entry.date)));
            this.costChartData = [...this.costChartData, {date: start, kg: 0}];
            this.costChartData = this.costChartData
                .map((entry) => {
                    return {key: new Date(entry.date), value: entry.kg};
                })
                .sort((a: any, b: any) => a.key - b.key)
                .reduce((acc, next) => { // acc stands for accumulator
                    const lastItemIndex = acc.length - 1;
                    const accHasContent = acc.length >= 1;

                    if (accHasContent && this.isSameDay(acc[lastItemIndex].key, next.key)) {
                        acc[lastItemIndex].value += next.value;
                    } else {
                        // first time seeing this entry. add it!
                        acc[lastItemIndex + 1] = next;
                    }

                    return acc;
                }, []);

            const end = today.endOf("day");

            this.costChartData.push({
                key: end,
                value: 0
            });
        }
        if (this._selectedChartIndex === 1) {
            // week
            this.wasteDistribution = this.bins.map((bin) => {
                return {type: bin.type, text: bin.text, value: bin.fullness};
            });

            this.bins.forEach((bin) => {
                bin.totalAmount = bin.entries
                    .filter((entry) => this.isWeek(new Date(entry.date)))
                    .map((entry) => entry.price)
                    .reduce((acc, curr) => acc + curr);

                bin.totalAmount = bin.totalAmount ? Math.round(bin.totalAmount * 100) / 100 : 0;
            });

            const today = moment();
            const start = today.startOf("week");

            this.costChartData = this.bins
                .map((bin) => bin.entries)
                .reduce((acc, curr) => [...acc, ...curr], [])
                .filter((entry) => this.isWeek(new Date(entry.date)));
            this.costChartData = [...this.costChartData, {date: start, kg: 0}];
            this.costChartData = this.costChartData
                .map((entry) => {
                    return {key: new Date(entry.date), value: entry.kg};
                })
                .sort((a: any, b: any) => a.key - b.key)
                .reduce((acc, next) => { // acc stands for accumulator
                    const lastItemIndex = acc.length - 1;
                    const accHasContent = acc.length >= 1;

                    if (accHasContent && this.isSameDay(acc[lastItemIndex].key, next.key)) {
                        acc[lastItemIndex].value += next.value;
                    } else {
                        // first time seeing this entry. add it!
                        acc[lastItemIndex + 1] = next;
                    }

                    return acc;
                }, []);

            const end = today.endOf("week");

            this.costChartData.push({
                key: end,
                value: 0
            });
        }
        if (this._selectedChartIndex === 2) {
            // month
            this.wasteDistribution = this.bins.map((bin) => {
                return {type: bin.type, text: bin.text, value: bin.fullness};
            });

            this.bins.forEach((bin) => {
                bin.totalAmount = bin.entries
                    .filter((entry) => this.isMonth(new Date(entry.date)))
                    .map((entry) => entry.price)
                    .reduce((acc, curr) => acc + curr);

                bin.totalAmount = bin.totalAmount ? Math.round(bin.totalAmount * 100) / 100 : 0;
            });

            const today = moment();
            const start = today.startOf("month");

            this.costChartData = this.bins
                .map((bin) => bin.entries)
                .reduce((acc, curr) => [...acc, ...curr], [])
                .filter((entry) => this.isMonth(new Date(entry.date)));
            this.costChartData = [...this.costChartData, {date: start, kg: 0}];
            this.costChartData = this.costChartData
                .map((entry) => {
                    return {key: new Date(entry.date), value: entry.kg};
                })
                .sort((a: any, b: any) => a.key - b.key)
                .reduce((acc, next) => { // acc stands for accumulator
                    const lastItemIndex = acc.length - 1;
                    const accHasContent = acc.length >= 1;

                    if (accHasContent && this.isSameDay(acc[lastItemIndex].key, next.key)) {
                        acc[lastItemIndex].value += next.value;
                    } else {
                        // first time seeing this entry. add it!
                        acc[lastItemIndex + 1] = next;
                    }

                    return acc;
                }, []);

            const end = today.endOf("month");

            this.costChartData.push({
                key: end,
                value: 0
            });

            console.log(this.costChartData);
        }
        if (this._selectedChartIndex === 3) {
            // year
            this.wasteDistribution = this.bins.map((bin) => {
                return {type: bin.type, text: bin.text, value: bin.fullness};
            });

            this.bins.forEach((bin) => {
                bin.totalAmount = bin.entries
                    .filter((entry) => this.isYear(new Date(entry.date)))
                    .map((entry) => entry.price)
                    .reduce((acc, curr) => acc + curr);

                bin.totalAmount = bin.totalAmount ? Math.round(bin.totalAmount * 100) / 100 : 0;
            });

            const today = moment();
            const start = today.startOf("year");

            this.costChartData = this.bins
                .map((bin) => bin.entries)
                .reduce((acc, curr) => [...acc, ...curr], [])
                .filter((entry) => this.isYear(new Date(entry.date)));
            this.costChartData = [...this.costChartData, {date: start, kg: 0}];
            this.costChartData = this.costChartData
                .map((entry) => {
                    return {key: new Date(entry.date), value: entry.kg};
                })
                .sort((a: any, b: any) => a.key - b.key)
                .reduce((acc, next) => { // acc stands for accumulator
                    const lastItemIndex = acc.length - 1;
                    const accHasContent = acc.length >= 1;

                    if (accHasContent && this.isSameDay(acc[lastItemIndex].key, next.key)) {
                        acc[lastItemIndex].value += next.value;
                    } else {
                        // first time seeing this entry. add it!
                        acc[lastItemIndex + 1] = next;
                    }

                    return acc;
                }, []);

            const end = today.endOf("year");

            this.costChartData.push({
                key: end,
                value: 0
            });

        }
        this.totalAmount = Math.round(this.bins.map((bin) => bin.totalAmount).reduce((acc, curr) => acc + curr) * 100) / 100.0;
    }

    private isSameDay(someDate: Date, otherDate) {
        return someDate.getDate() == otherDate.getDate() &&
            someDate.getMonth() == otherDate.getMonth() &&
            someDate.getFullYear() == otherDate.getFullYear();
    }

    private isToday(someDate: Date) {
        const today = new Date();

        return someDate.getDate() == today.getDate() &&
            someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear();
    }

    private isWeek(someDate: Date) {
        const today = new Date();

        return moment(someDate, "YYYYMMDD").isSame(today, "week");
    }

    private isMonth(someDate: Date) {
        const today = new Date();

        return someDate.getMonth() == today.getMonth() &&
            someDate.getFullYear() == today.getFullYear();
    }

    private isYear(someDate: Date) {
        const today = new Date();

        return someDate.getFullYear() == today.getFullYear();
    }

    private calculateBinData(bins) {
        this.bins = bins;

        this.bins.forEach((bin) => {
            bin.text = bin.type === "GREEN" ? "Bio" : (bin.type === "YELLOW" ? "Plastic" : (bin.type === "BLACK" ? "Residual waste" : "Paper"));
        });

        this.bins.forEach((bin) => {
            bin.fullness = bin.entries.map((e) => e.kg).reduce((acc, curr) => acc + curr);
            bin.fullness = bin.fullness ? bin.fullness : 0;
            bin.percentage = Math.round(bin.fullness / bin.capacity * 100);
        });

        this.calculateForSelection();
    }
}
