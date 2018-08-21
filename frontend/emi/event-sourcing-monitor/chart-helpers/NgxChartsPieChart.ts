export class NgxChartsPieChart {
  name: string;
  doughnut: boolean;
  explodeSlices: boolean;
  results: { name: string; value: number }[];
  gradient: boolean;
  labels: boolean;
  legend: boolean;
  scheme: { domain: string[] };
  onSelect: () => void;
  clearResultData: () => void;
  updateResultData: () => void;
  constructor(name: string){
    this.name = name;
    this.doughnut = true;
    this.results = [];
    this.explodeSlices = false;
    this.gradient = false;
    this.labels = true;
    this.legend = false;
    this.scheme = {
      domain: ['#f44336', '#9c27b0', '#b74945', '#b77845', '#b7a045', '#aab745', '#60b745', '#45b7ae', '#456bb7', '#9745b7', '#9b9597']
    };
  }
}

