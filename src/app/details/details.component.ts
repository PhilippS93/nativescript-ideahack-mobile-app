import { AfterContentInit, Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { RouterExtensions } from "nativescript-angular";
import { ActivatedRoute } from "@angular/router";
import { startWith, take, takeUntil } from "rxjs/internal/operators";
import * as moment from "moment";
import { interval, Subject } from "rxjs";
import { TrashCanService } from "~/app/services/trash-can.service";

@Component({
    selector: "Details",
    templateUrl: "./details.component.html",
    styleUrls: ["./details.scss"]
})
export class DetailsComponent implements OnInit, OnDestroy, AfterContentInit {
    loaded: boolean = false;
    bin;
    _selectedChartIndex: number = 0;
    private costChartData = [];
    private totalAmount: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _routerExtensions: RouterExtensions,
        private zone: NgZone,
        private trashCanService: TrashCanService,
        private activatedRoute: ActivatedRoute
    ) {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        this.activatedRoute.queryParams
            .pipe(
                take(1)
                // switchMap((params) => this.routeGQL.fetch({id: params.routeId}))
            )
            .subscribe((params) => {
                const binid = params.binID;

                const source = interval(2000);

                const subscribe = source
                    .pipe(startWith(0))
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((val) => {
                        this.trashCanService.getTrashCans()
                            .subscribe((bins: any) => {
                                this.bin = bins.filter((bin) => bin.id === binid)[0];

                                this.bin.text = this.bin.type === "GREEN" ? "Bio" : (this.bin.type === "YELLOW" ? "Plastic" : (this.bin.type === "BLACK" ? "Residual waste" : "Paper"));

                                this.bin.fullness = this.bin.entries.map((e) => e.kg).reduce((acc, curr) => acc + curr);
                                this.bin.fullness = this.bin.fullness ? this.bin.fullness : 0;
                                this.bin.percentage = Math.round(this.bin.fullness / this.bin.capacity * 100);
                                let weight = 0;
                                this.bin.entries.reverse().forEach((entry) => {
                                    weight += entry.kg;
                                    entry.percentage = Math.round(weight / this.bin.capacity * 100);
                                });
                                this.bin.entries.reverse();
                                this.calculateForSelection();
                            });

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
            this._routerExtensions.navigate(["content/intern/profile-edit"], {
                clearHistory: false,
                animated: true,
                transition: {
                    name: "slideLeft",
                    duration: 350,
                    curve: "ease"
                }
            });
        });
    }

    goBack() {
        this._routerExtensions.backToPreviousPage();
    }

    private calculateForSelection() {
        if (this._selectedChartIndex === 0) {
            // day
            this.bin.totalAmount = this.bin.entries
                .filter((entry) => this.isToday(new Date(entry.date)))
                .map((entry) => entry.price)
                .reduce((acc, curr) => acc + curr);

            this.bin.totalAmount = this.bin.totalAmount ? this.bin.totalAmount : 0;

            const today = moment();
            const start = today.startOf("day");

            this.costChartData = this.bin.entries
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
            this.bin.totalAmount = this.bin.entries
                .filter((entry) => this.isWeek(new Date(entry.date)))
                .map((entry) => entry.price)
                .reduce((acc, curr) => acc + curr);

            this.bin.totalAmount = this.bin.totalAmount ? this.bin.totalAmount : 0;

            const today = moment();
            const start = today.startOf("week");

            this.costChartData = this.bin.entries
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
            this.bin.totalAmount = this.bin.entries
                .filter((entry) => this.isMonth(new Date(entry.date)))
                .map((entry) => entry.price)
                .reduce((acc, curr) => acc + curr);

            this.bin.totalAmount = this.bin.totalAmount ? this.bin.totalAmount : 0;

            const today = moment();
            const start = today.startOf("month");

            this.costChartData = this.bin.entries
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
            this.bin.totalAmount = this.bin.entries
                .filter((entry) => this.isYear(new Date(entry.date)))
                .map((entry) => entry.price)
                .reduce((acc, curr) => acc + curr);

            this.bin.totalAmount = this.bin.totalAmount ? this.bin.totalAmount : 0;

            const today = moment();
            const start = today.startOf("year");

            this.costChartData = this.bin.entries
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

        this.totalAmount = Math.round(this.bin.totalAmount * 100) / 100;
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
}
