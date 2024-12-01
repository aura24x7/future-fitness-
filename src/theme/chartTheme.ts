// Custom theme for Victory charts
export const chartTheme = {
  chart: {
    padding: { top: 10, bottom: 40, left: 60, right: 40 }
  },
  axis: {
    style: {
      grid: {
        fill: "none",
        stroke: "none"
      },
      tickLabels: {
        fill: "#666",
        fontSize: 12,
        padding: 5
      },
      axis: {
        stroke: "#666",
        strokeWidth: 1
      },
      axisLabel: {
        padding: 30,
        fill: "#666",
        fontSize: 14
      }
    }
  },
  line: {
    style: {
      data: {
        stroke: "#6366f1",
        strokeWidth: 2
      },
      labels: {
        fill: "#666",
        fontSize: 12,
        padding: 5
      }
    }
  },
  bar: {
    style: {
      data: {
        fill: "#6366f1",
        width: 20
      },
      labels: {
        fill: "#666",
        fontSize: 12,
        padding: 5
      }
    }
  },
  pie: {
    style: {
      data: {
        stroke: "#fff",
        strokeWidth: 1,
        padding: 10
      },
      labels: {
        fill: "#666",
        fontSize: 12,
        fontWeight: "bold",
        padding: 5
      }
    }
  },
  tooltip: {
    style: {
      fill: "#fff",
      fontSize: 12,
      fontWeight: "bold"
    },
    flyout: {
      fill: "rgba(0, 0, 0, 0.8)",
      strokeWidth: 1,
      padding: 10
    }
  }
};
