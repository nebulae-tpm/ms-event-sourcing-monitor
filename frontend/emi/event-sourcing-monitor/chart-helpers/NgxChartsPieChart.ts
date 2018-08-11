export class NgxChartsPieChart {
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
  constructor(){
    this.doughnut = true;
    this.results = [];
    this.explodeSlices = false;
    this.gradient = false;
    this.labels = true;
    this.legend = false;
    this.scheme = {
      domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63']
    };
  }
}

