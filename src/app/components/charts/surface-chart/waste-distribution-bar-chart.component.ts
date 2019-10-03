import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { WebView } from "tns-core-modules/ui/web-view";
import { isAndroid } from "tns-core-modules/platform";
import { Scripts } from "~/app/components/charts/scripts";
import { Config } from "~/app/core/config/constants";

@Component({
    selector: "ns-waste-distribution-bar-chart",
    moduleId: module.id,
    templateUrl: "./waste-distribution-bar-chart.component.html"
})
export class WasteDistributionBarChartComponent implements OnInit, AfterViewInit {

    @ViewChild("container", {static: true}) container: ElementRef;
    @Input() legendEnabled: boolean = true;
    src: string;
    height = 30;
    surfaces: Array<{ color: string; name: string; type; value: number }>;
    private _data;
    private initialized = false;

    @Input()
    set surfaceData(val) {
        if (!val) {
            return;
        }

        this._data = val;

        if (this.initialized) {
            this.src = this.createHTML(val);
        }
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        if (this._data) {
            setTimeout(() => {
                this.src = this.createHTML(this._data);
                this.initialized = true;
            }, 100);
        } else {
            this.initialized = true;
        }
    }

    onWebViewLoaded(webargs) {
        const webview = webargs.object;
        if (isAndroid) {
            webview.android.getSettings().setDisplayZoomControls(false);
            webview.android.getSettings().setLoadWithOverviewMode(true);

            webview.android.setBackgroundColor(0x00000000);
        }
    }

    private createHTML(data) {
        this.surfaces = data.map((el) => ({
            type: el.type,
            name: el.text,
            color: Config.wasteColor(el.type),
            value: el.value
        })).reverse();

        const view: WebView = this.container.nativeElement;
        const width = view.getActualSize().width;

        const chartData = data.map((surfacePart) => {
            return {
                name: surfacePart.type.toString(),
                data: [surfacePart.value]
            };
        });

        const colors = data.map((el) => Config.wasteColor(el.type));

        if (chartData.length === 0) {
            return;
        }

        return `
<html lang="en" style="margin:0;padding:0;">
<head>
    <meta charset="utf-8" />
    <meta name="author" content="enduco" />
    <title></title>
    <script type="text/javascript">
     ${Scripts.JQUERY}
    </script>
    <script type="text/javascript">
   
    </script>
</head>
<body style="margin:0;padding:0;">

<div id="chart" style="border-radius: 10000px;"></div>
<script type='text/javascript'>
        document.addEventListener('DOMContentLoaded', function () {
              ${Scripts.HIGHCHARTS}
              
            new Highcharts.chart({
            chart: {
                renderTo: 'chart',
                type: 'bar',
                spacing: [0, 0, 0, 0],
                selectionMarkerFill: 'none',
                 margin: [0, 0, 0, 0],
                 padding: [0, 0, 0, 0],
                 width: ${width},
                height: ${this.height}
            },
    title: {
        text: null
    },
    colors: ${JSON.stringify(colors)},
    accessibility: {
        enabled: false
    },
    exporting: {
        enabled: false
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false
    },
    tooltip: {
          enabled: false
    },
    yAxis: {
        visible: false,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0,
        minPadding: 0
    },
    xAxis: {
        visible: false,
        maxPadding: 0,
        minPadding: 0
    },
    plotOptions: {
         series: {
             selected: false,
            states: {
                hover: {
                    enabled: false
                }
            }
          },
        bar: {
            selected: false,
            minPointLength: 0,
            stacking: 'normal',
            grouping: false,
            shadow: false,
            pointPadding: 0,
            pointWidth: ${this.height}
        }
    },
    series: ${JSON.stringify(chartData)}
        });
        });
    </script>
</body>`;
    }

    catcher() {

    }
}
