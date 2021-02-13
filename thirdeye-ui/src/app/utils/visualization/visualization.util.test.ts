import { ScaleTime } from "d3-scale";
import { cloneDeep } from "lodash";
import { Settings } from "luxon";
import {
    AlertEvaluationAnomalyPoint,
    AlertEvaluationTimeSeriesPoint,
} from "../../components/visualizations/alert-evaluation-time-series/alert-evaluation-time-series.interfaces";
import { Alert, AlertEvaluation } from "../../rest/dto/alert.interfaces";
import { Anomaly } from "../../rest/dto/anomaly.interfaces";
import {
    DetectionData,
    DetectionEvaluation,
} from "../../rest/dto/detection.interfaces";
import {
    filterAlertEvaluationAnomalyPointsByTime,
    filterAlertEvaluationTimeSeriesPointsByTime,
    formatDateTimeForAxis,
    formatLargeNumberForVisualization,
    getAlertEvaluationAnomalyPoints,
    getAlertEvaluationTimeSeriesPointAtTime,
    getAlertEvaluationTimeSeriesPoints,
    getAlertEvaluationTimeSeriesPointsMaxTimestamp,
    getAlertEvaluationTimeSeriesPointsMaxValue,
    getAlertEvaluationTimeSeriesPointsMinTimestamp,
    getTimeTickValuesForAxis,
} from "./visualization.util";

const systemLocale = Settings.defaultLocale;
const systemZoneName = Settings.defaultZoneName;

jest.mock("../number/number.util", () => ({
    formatLargeNumber: jest.fn().mockImplementation((num) => num.toString()),
}));

describe("Visualization Util", () => {
    beforeAll(() => {
        // Explicitly set locale and time zone to make sure date time manipulations and literal
        // results are consistent regardless of where tests are run
        Settings.defaultLocale = "en-US";
        Settings.defaultZoneName = "America/Los_Angeles";
    });

    afterAll(() => {
        // Restore locale and time zone
        Settings.defaultLocale = systemLocale;
        Settings.defaultZoneName = systemZoneName;
    });

    test("formatLargeNumberForVisualization should return empty string for invalid number", () => {
        expect(
            formatLargeNumberForVisualization((null as unknown) as number)
        ).toEqual("");
    });

    test("formatLargeNumberForVisualization should return appropriate string for number", () => {
        expect(formatLargeNumberForVisualization(1)).toEqual("1");
    });

    test("formatLargeNumberForVisualization should return appropriate string for object", () => {
        expect(
            formatLargeNumberForVisualization({
                valueOf: () => 1,
            })
        ).toEqual("1");
    });

    test("formatDateTimeForAxis should return empty string for invalid date", () => {
        expect(
            formatDateTimeForAxis((null as unknown) as number, mockScale)
        ).toEqual("");
    });

    test("formatDateTimeForAxis should return empty string for invalid scale", () => {
        expect(
            formatDateTimeForAxis(
                1,
                (null as unknown) as ScaleTime<number, number>
            )
        ).toEqual("");
    });

    test("formatDateTimeForAxis should return appropriate string for date and scale", () => {
        mockScaleDomain = [new Date(1543651200000), new Date(1669881600000)];

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual("2020");
    });

    test("formatDateTimeForAxis should return appropriate string for object and scale", () => {
        mockScaleDomain = [new Date(1543651200000), new Date(1669881600000)];

        expect(
            formatDateTimeForAxis(
                {
                    valueOf: () => 1606852800000,
                },
                mockScale
            )
        ).toEqual("2020");
    });

    test("formatDateTimeForAxis should return appropriate string for date and scale domain interval of more than 2 years", () => {
        mockScaleDomain = [new Date(1543651200000), new Date(1669881600000)];

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual("2020");
    });

    test("formatDateTimeForAxis should return appropriate string for date and scale domain interval of less than or equal to 2 years and more than 2 months", () => {
        mockScaleDomain = [new Date(1575273600000), new Date(1638345600000)]; // Interval = 2 years

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual(
            "Dec 2020"
        );

        mockScaleDomain = [new Date(1577865600000), new Date(1638345600000)]; // Interval < 2 years

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual(
            "Dec 2020"
        );
    });

    test("formatDateTimeForAxis should return appropriate string for date and scale domain interval of less than or equal to 2 months and more than 2 days", () => {
        mockScaleDomain = [new Date(1604304000000), new Date(1609488000000)]; // Interval = 2 months

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual(
            "Dec 01, 2020"
        );

        mockScaleDomain = [new Date(1606723200000), new Date(1609488000000)]; // Interval < 2 months

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual(
            "Dec 01, 2020"
        );
    });

    test("formatDateTimeForAxis should return appropriate string for date and scale domain interval of less than or equal to 2 days", () => {
        mockScaleDomain = [new Date(1606723200000), new Date(1606896000000)]; // Interval = 2 days

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual(
            "Dec 01, 2020@12:00 PM"
        );

        mockScaleDomain = [new Date(1606852800000), new Date(1606896000000)]; // Interval < 2 days

        expect(formatDateTimeForAxis(1606852800000, mockScale)).toEqual(
            "Dec 01, 2020@12:00 PM"
        );
    });

    test("getTimeTickValuesForAxis should return empty array for number of ticks and invalid scale", () => {
        expect(
            getTimeTickValuesForAxis(
                1,
                (null as unknown) as ScaleTime<number, number>
            )
        ).toEqual([]);
    });

    test("getTimeTickValuesForAxis should return appropriate time tick value array for invalid number of ticks and scale", () => {
        mockScaleDomain = [new Date(1575187200000), new Date(1606852800000)];
        const timeTickValues = getTimeTickValuesForAxis(
            (null as unknown) as number,
            mockScale
        );

        expect(timeTickValues).toHaveLength(8);
        expect(timeTickValues[0]).toEqual(1575187200000);
        expect(timeTickValues[1]).toEqual(1579710857142.8572);
        expect(timeTickValues[2]).toEqual(1584234514284.8572);
        expect(timeTickValues[3]).toEqual(1588758171426.8572);
        expect(timeTickValues[4]).toEqual(1593281828568.8572);
        expect(timeTickValues[5]).toEqual(1597805485710.8572);
        expect(timeTickValues[6]).toEqual(1602329142852.8572);
        expect(timeTickValues[7]).toEqual(1606852800000);
    });

    test("getTimeTickValuesForAxis should return appropriate time tick value array for number of ticks less than 3 and scale", () => {
        mockScaleDomain = [new Date(1575187200000), new Date(1606852800000)];
        const timeTickValues = getTimeTickValuesForAxis(1, mockScale);

        expect(timeTickValues).toHaveLength(2);
        expect(timeTickValues[0]).toEqual(1575187200000);
        expect(timeTickValues[1]).toEqual(1606852800000);
    });

    test("getTimeTickValuesForAxis should return appropriate time tick value array for number of ticks and scale", () => {
        mockScaleDomain = [new Date(1575187200000), new Date(1606852800000)];
        let timeTickValues = getTimeTickValuesForAxis(3, mockScale);

        expect(timeTickValues).toHaveLength(3);
        expect(timeTickValues[0]).toEqual(1575187200000);
        expect(timeTickValues[1]).toEqual(1591020000000);
        expect(timeTickValues[2]).toEqual(1606852800000);

        mockScaleDomain = [new Date(1606852800000), new Date(1606852800000)];
        timeTickValues = getTimeTickValuesForAxis(3, mockScale);

        expect(timeTickValues).toHaveLength(2);
        expect(timeTickValues[0]).toEqual(1606852800000);
        expect(timeTickValues[1]).toEqual(1606852800000);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for invalid alert evaluation", () => {
        expect(
            getAlertEvaluationTimeSeriesPoints(
                (null as unknown) as AlertEvaluation
            )
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for invalid detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations = (null as unknown) as {
            [index: string]: DetectionEvaluation;
        };

        expect(
            getAlertEvaluationTimeSeriesPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for empty detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations = {};

        expect(
            getAlertEvaluationTimeSeriesPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for invalid data in detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations.detectionEvaluation1 = {
            data: (null as unknown) as DetectionData,
        } as DetectionEvaluation;

        expect(
            getAlertEvaluationTimeSeriesPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for empty data in detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations.detectionEvaluation1 = {
            data: {},
        } as DetectionEvaluation;

        expect(
            getAlertEvaluationTimeSeriesPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for invalid timestamps in detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations.detectionEvaluation1 = {
            data: {
                timestamp: (null as unknown) as number[],
            },
        } as DetectionEvaluation;

        expect(
            getAlertEvaluationTimeSeriesPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return empty array for empty timestamps in detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations.detectionEvaluation1 = {
            data: {
                timestamp: [] as number[],
            },
        } as DetectionEvaluation;

        expect(
            getAlertEvaluationTimeSeriesPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationTimeSeriesPoints should return appropriate alert evaluation time series points for alert evaluation", () => {
        expect(getAlertEvaluationTimeSeriesPoints(mockAlertEvaluation)).toEqual(
            mockAlertEvaluationTimeSeriesPoints
        );
    });

    test("getAlertEvaluationAnomalyPoints should return empty array for invalid alert evaluation", () => {
        expect(
            getAlertEvaluationAnomalyPoints(
                (null as unknown) as AlertEvaluation
            )
        ).toEqual([]);
    });

    test("getAlertEvaluationAnomalyPoints should return empty array for invalid detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations = (null as unknown) as {
            [index: string]: DetectionEvaluation;
        };

        expect(
            getAlertEvaluationAnomalyPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationAnomalyPoints should return empty array for empty detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations = {};

        expect(
            getAlertEvaluationAnomalyPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationAnomalyPoints should return empty array for invalid anomalies in detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations.detectionEvaluation1 = {
            anomalies: (null as unknown) as Anomaly[],
        } as DetectionEvaluation;

        expect(
            getAlertEvaluationAnomalyPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationAnomalyPoints should return empty array for empty anomalies in detection evaluation", () => {
        const mockAlertEvaluationCopy = cloneDeep(mockAlertEvaluation);
        mockAlertEvaluationCopy.detectionEvaluations.detectionEvaluation1 = {
            anomalies: [] as Anomaly[],
        } as DetectionEvaluation;

        expect(
            getAlertEvaluationAnomalyPoints(mockAlertEvaluationCopy)
        ).toEqual([]);
    });

    test("getAlertEvaluationAnomalyPoints should return appropriate alert evaluation anomaly points for alert evaluation", () => {
        expect(getAlertEvaluationAnomalyPoints(mockAlertEvaluation)).toEqual(
            mockAlertEvaluationAnomalyPoints
        );
    });

    test("getAlertEvaluationTimeSeriesPointsMinTimestamp should return 0 for invalid alert evaluation time series points", () => {
        expect(
            getAlertEvaluationTimeSeriesPointsMinTimestamp(
                (null as unknown) as AlertEvaluationTimeSeriesPoint[]
            )
        ).toEqual(0);
    });

    test("getAlertEvaluationTimeSeriesPointsMinTimestamp should return 0 for empty alert evaluation time series points", () => {
        expect(getAlertEvaluationTimeSeriesPointsMinTimestamp([])).toEqual(0);
    });

    test("getAlertEvaluationTimeSeriesPointsMinTimestamp should return appropriate timestamp for alert evaluation time series points", () => {
        expect(
            getAlertEvaluationTimeSeriesPointsMinTimestamp(
                mockAlertEvaluationTimeSeriesPoints
            )
        ).toEqual(1);
    });

    test("getAlertEvaluationTimeSeriesPointsMaxTimestamp should return 0 for invalid alert evaluation time series points", () => {
        expect(
            getAlertEvaluationTimeSeriesPointsMaxTimestamp(
                (null as unknown) as AlertEvaluationTimeSeriesPoint[]
            )
        ).toEqual(0);
    });

    test("getAlertEvaluationTimeSeriesPointsMaxTimestamp should return 0 for empty alert evaluation time series points", () => {
        expect(getAlertEvaluationTimeSeriesPointsMaxTimestamp([])).toEqual(0);
    });

    test("getAlertEvaluationTimeSeriesPointsMaxTimestamp should return appropriate timestamp for alert evaluation time series points", () => {
        expect(
            getAlertEvaluationTimeSeriesPointsMaxTimestamp(
                mockAlertEvaluationTimeSeriesPoints
            )
        ).toEqual(3);
    });

    test("getAlertEvaluationTimeSeriesPointsMaxValue should return 0 for invalid alert evaluation time series points", () => {
        expect(
            getAlertEvaluationTimeSeriesPointsMaxValue(
                (null as unknown) as AlertEvaluationTimeSeriesPoint[]
            )
        ).toEqual(0);
    });

    test("getAlertEvaluationTimeSeriesPointsMaxValue should return 0 for empty alert evaluation time series points", () => {
        expect(getAlertEvaluationTimeSeriesPointsMaxValue([])).toEqual(0);
    });

    test("getAlertEvaluationTimeSeriesPointsMaxValue should return appropriate value for alert evaluation time series points", () => {
        expect(
            getAlertEvaluationTimeSeriesPointsMaxValue(
                mockAlertEvaluationTimeSeriesPoints
            )
        ).toEqual(15);

        const mockAlertEvaluationTimeSeriesPointsCopy = cloneDeep(
            mockAlertEvaluationTimeSeriesPoints
        );
        mockAlertEvaluationTimeSeriesPointsCopy[0].current = NaN;
        mockAlertEvaluationTimeSeriesPointsCopy[1].lowerBound = NaN;
        mockAlertEvaluationTimeSeriesPointsCopy[2].upperBound = NaN;
        mockAlertEvaluationTimeSeriesPointsCopy[0].expected = NaN;

        expect(
            getAlertEvaluationTimeSeriesPointsMaxValue(
                mockAlertEvaluationTimeSeriesPointsCopy
            )
        ).toEqual(15);
    });
});

test("filterAlertEvaluationTimeSeriesPointsByTime should return empty array for invalid alert evaluation time series points", () => {
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            (null as unknown) as AlertEvaluationTimeSeriesPoint[],
            1,
            2
        )
    ).toEqual([]);
});

test("filterAlertEvaluationTimeSeriesPointsByTime should return empty array for empty alert evaluation time series points", () => {
    expect(filterAlertEvaluationTimeSeriesPointsByTime([], 1, 2)).toEqual([]);
});

test("filterAlertEvaluationTimeSeriesPointsByTime should return appropriate alert evaluation time series points for alert evaluation time series points and invalid start and end time", () => {
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            (null as unknown) as number,
            1
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoints);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            1,
            (null as unknown) as number
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoints);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            (null as unknown) as number,
            (null as unknown) as number
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoints);
});

test("filterAlertEvaluationTimeSeriesPointsByTime should return appropriate alert evaluation time series points for alert evaluation time series points and start and end time", () => {
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            2,
            2
        )
    ).toEqual([mockAlertEvaluationTimeSeriesPoint2]);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            1,
            3
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoints);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            -1,
            4
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoints);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            -1,
            2
        )
    ).toEqual([
        mockAlertEvaluationTimeSeriesPoint1,
        mockAlertEvaluationTimeSeriesPoint2,
    ]);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            2,
            4
        )
    ).toEqual([
        mockAlertEvaluationTimeSeriesPoint2,
        mockAlertEvaluationTimeSeriesPoint3,
    ]);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            -2,
            -1
        )
    ).toEqual([]);
    expect(
        filterAlertEvaluationTimeSeriesPointsByTime(
            mockAlertEvaluationTimeSeriesPoints,
            4,
            5
        )
    ).toEqual([]);
});

test("filterAlertEvaluationAnomalyPointsByTime should return empty array for invalid alert evaluation anomaly points", () => {
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            (null as unknown) as AlertEvaluationAnomalyPoint[],
            1,
            2
        )
    ).toEqual([]);
});

test("filterAlertEvaluationAnomalyPointsByTime should return empty array for empty alert evaluation anomaly points", () => {
    expect(filterAlertEvaluationAnomalyPointsByTime([], 1, 2)).toEqual([]);
});

test("filterAlertEvaluationAnomalyPointsByTime should return appropriate alert evaluation anomaly points for alert evaluation anomaly points and invalid start and end time", () => {
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            (null as unknown) as number,
            1
        )
    ).toEqual(mockAlertEvaluationAnomalyPoints);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            1,
            (null as unknown) as number
        )
    ).toEqual(mockAlertEvaluationAnomalyPoints);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            (null as unknown) as number,
            (null as unknown) as number
        )
    ).toEqual(mockAlertEvaluationAnomalyPoints);
});

test("filterAlertEvaluationAnomalyPointsByTime should return appropriate alert evaluation anomaly points for alert evaluation anomaly points and start and end time", () => {
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            16,
            16
        )
    ).toEqual([mockAlertEvaluationAnomalyPoint1]);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            16,
            20
        )
    ).toEqual(mockAlertEvaluationAnomalyPoints);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            15,
            25
        )
    ).toEqual(mockAlertEvaluationAnomalyPoints);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            15,
            18
        )
    ).toEqual([mockAlertEvaluationAnomalyPoint1]);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            18,
            25
        )
    ).toEqual([mockAlertEvaluationAnomalyPoint2]);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            14,
            15
        )
    ).toEqual([]);
    expect(
        filterAlertEvaluationAnomalyPointsByTime(
            mockAlertEvaluationAnomalyPoints,
            22,
            14
        )
    ).toEqual([]);
});

test("getAlertEvaluationTimeSeriesPointAtTime should return null for invalid alert evaluation time series points", () => {
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            (null as unknown) as AlertEvaluationTimeSeriesPoint[],
            1
        )
    ).toBeNull();
});

test("getAlertEvaluationTimeSeriesPointAtTime should return null for empty alert evaluation time series points", () => {
    expect(getAlertEvaluationTimeSeriesPointAtTime([], 1)).toBeNull();
});

test("getAlertEvaluationTimeSeriesPointAtTime should return null for alert evaluation time series points and invalid time", () => {
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            mockAlertEvaluationTimeSeriesPoints,
            (null as unknown) as number
        )
    ).toBeNull();
});

test("getAlertEvaluationTimeSeriesPointAtTime should return appropriate alert evaluation time series point for alert evaluation time series points and time", () => {
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            mockAlertEvaluationTimeSeriesPoints,
            2
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoint2);
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            mockAlertEvaluationTimeSeriesPoints,
            1
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoint1);
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            mockAlertEvaluationTimeSeriesPoints,
            3
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoint3);
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            mockAlertEvaluationTimeSeriesPoints,
            -1
        )
    ).toBeNull();
    expect(
        getAlertEvaluationTimeSeriesPointAtTime(
            mockAlertEvaluationTimeSeriesPoints,
            4
        )
    ).toEqual(mockAlertEvaluationTimeSeriesPoint3);
});

let mockScaleDomain: Date[] = [];

const mockScale = ({
    domain: jest.fn().mockImplementation(() => mockScaleDomain),
} as unknown) as ScaleTime<number, number>;

const mockAlertEvaluation = {
    alert: {} as Alert,
    detectionEvaluations: {
        detectionEvaluation1: {
            data: {
                timestamp: [1, 2, 3],
                upperBound: [4, 5, 6],
                lowerBound: [7, 8, 9],
                current: [10, 11, 12],
                expected: [13, 14, 15],
            },
            anomalies: [
                {
                    startTime: 16,
                    endTime: 17,
                    avgCurrentVal: 18,
                    avgBaselineVal: 19,
                },
                {
                    startTime: 20,
                    endTime: 21,
                    avgCurrentVal: 22,
                    avgBaselineVal: 23,
                },
            ],
        } as DetectionEvaluation,
        detectionEvaluation2: {
            data: {
                timestamp: [24],
                upperBound: [25],
                lowerBound: [26],
                current: [27],
                expected: [28],
            },
            anomalies: [
                {
                    startTime: 29,
                    endTime: 30,
                    avgCurrentVal: 31,
                    avgBaselineVal: 32,
                },
                {
                    startTime: 33,
                    endTime: 34,
                    avgCurrentVal: 35,
                    avgBaselineVal: 36,
                },
            ],
        } as DetectionEvaluation,
    },
    start: 37,
    end: 38,
    lastTimestamp: 39,
} as AlertEvaluation;

const mockAlertEvaluationTimeSeriesPoint1 = {
    timestamp: 1,
    upperBound: 4,
    lowerBound: 7,
    current: 10,
    expected: 13,
};

const mockAlertEvaluationTimeSeriesPoint2 = {
    timestamp: 2,
    upperBound: 5,
    lowerBound: 8,
    current: 11,
    expected: 14,
};

const mockAlertEvaluationTimeSeriesPoint3 = {
    timestamp: 3,
    upperBound: 6,
    lowerBound: 9,
    current: 12,
    expected: 15,
};

const mockAlertEvaluationTimeSeriesPoints = [
    mockAlertEvaluationTimeSeriesPoint1,
    mockAlertEvaluationTimeSeriesPoint2,
    mockAlertEvaluationTimeSeriesPoint3,
];

const mockAlertEvaluationAnomalyPoint1 = {
    startTime: 16,
    endTime: 17,
    current: 18,
    baseline: 19,
};

const mockAlertEvaluationAnomalyPoint2 = {
    startTime: 20,
    endTime: 21,
    current: 22,
    baseline: 23,
};

const mockAlertEvaluationAnomalyPoints = [
    mockAlertEvaluationAnomalyPoint1,
    mockAlertEvaluationAnomalyPoint2,
];