import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { WebView } from "tns-core-modules/ui/web-view";
import { isAndroid } from "tns-core-modules/platform";
import { Scripts } from "~/app/components/charts/scripts";

@Component({
    selector: "ns-cost-chart",
    moduleId: module.id,
    templateUrl: "./cost-chart.component.html"
})
export class CostChartComponent implements OnInit, AfterViewInit {

    @ViewChild("webview", {static: true}) webview: ElementRef;
    @ViewChild("container", {static: true}) container: ElementRef;
    src: string;
    height = 120;
    min: string;
    max: string;
    private initialized = false;

    private _data;

    @Input()
    set data(val) {
        if (!val) {
            return;
        }

        this._data = val;

        if (this.initialized) {
            this.src = this.createHTML(val);
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

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        if (this._data) {
            setTimeout(() => {
                this.src = this.createHTML(this._data);
                this.initialized = true;
            });
        } else {
            this.initialized = true;
        }
    }

    private createHTML(elevation) {

        const view: WebView = this.container.nativeElement;
        const width = view.getActualSize().width;

        if (elevation.length === 0) {
            return;
        }

        const data = elevation.map((el) => {
            return [(new Date(el.key)).getTime(), el.value];
        });

        return `
<html lang="en" style="background-color: transparent;">

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

  <body style="margin:0;padding:0; background-color: transparent;">

    <!-- <div>NativeScript Charts</div> -->

    <div id="chart" style="background-color: transparent;"></div>
    <script type='text/javascript'>
     document.addEventListener('DOMContentLoaded', function () {
      ${Scripts.HIGHCHARTS}
    
      new Highcharts.Chart({
        chart: {
          renderTo: 'chart',
          type: 'spline',
          spacing: [0, 0, 0, 0],
          margin: [0, 0, 0, 0],
          width: ${width},
          height: ${this.height},
          backgroundColor: '#3A53FF00'
        },
        title: {
          text: null
        },
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
        colors: ['#000000'],
        yAxis: {
          visible: true,
          startOnTick: false,
          endOnTick: false,
          min: 0,
          gridLineWidth: 0,
          minorGridLineWidth: 0,
        },
        xAxis: {
            type: 'datetime',
          visible: false,
          maxPadding: 0,
          minPadding: 0,
        },
        tooltip: {
          formatter: function() {
            return 'Cost: ' + this.y + ' m';
          },
          enabled: false
        },
        plotOptions: {
          series: {
            states: {
                hover: {
                    enabled: false
                }
            }
          },
          areaspline: {
            threshold: null,
            lineWidth: 2,
            marker: {
              enabled: false,
              states: {
                hover: {
                  enabled: true,
                  radius: 5
                }
              }
            },
            shadow: false,
            states: {
              hover: {
                lineWidth: 1
              }
            }
          }
        },

        series: [{
          type: "areaspline",
          fillColor: {
            linearGradient: [0, 0, 0, ${0.9 * this.height}],
            stops: [
              [0, 'rgba(0,0,0,0.2)'],
              [1, 'rgba(0,0,0,0)']
            ]
          },
          data: ${JSON.stringify(data)}
        }]
      });
});
    </script>
  </body>
`;
    }
}
