import LuxonUtils from "@date-io/luxon";
import {
    Box,
    Button,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Popover,
    Tooltip,
    Typography,
} from "@material-ui/core";
import { CalendarToday } from "@material-ui/icons";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import classnames from "classnames";
import { cloneDeep } from "lodash";
import React, {
    FunctionComponent,
    MouseEvent,
    useEffect,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Dimension } from "../../utils/material-ui-util/dimension-util";
import { Palette } from "../../utils/material-ui-util/palette-util";
import {
    getTimeRangeDuration,
    renderTimeRange,
    renderTimeRangeDuration,
} from "../../utils/time-range-util/time-range-util";
import {
    TimeRange,
    TimeRangeDuration,
    TimeRangeSelectorProps,
} from "./time-range-selector.interfaces";
import { useTimeRangeSelectorStyles } from "./time-range-selector.styles";

export const TimeRangeSelector: FunctionComponent<TimeRangeSelectorProps> = (
    props: TimeRangeSelectorProps
) => {
    const timeRangeSelectorClasses = useTimeRangeSelectorStyles();
    const [timeRangeDuration, setTimeRangeDuration] = useState<
        TimeRangeDuration
    >(props.getTimeRangeDuration());
    const [
        timeRangeSelectorAnchorElement,
        setTimeRangeSelectorAnchorElement,
    ] = useState<HTMLElement | null>();
    const { t } = useTranslation();

    useEffect(() => {
        setTimeRangeDuration(props.getTimeRangeDuration());
    }, [props.timeRange]);

    const onTimeRangeButtonClick = (event: MouseEvent<HTMLElement>): void => {
        setTimeRangeSelectorAnchorElement(event.currentTarget);
    };

    const onTimeRangeSelectorOpen = (): void => {
        // Update component state time range duration
        setTimeRangeDuration(props.getTimeRangeDuration());
    };

    const onRecentCustomTimeRangeDurationClick = (
        timeRangeDuration: TimeRangeDuration
    ): void => {
        if (!timeRangeDuration) {
            return;
        }

        // Update component state time range duration to selected time range
        setTimeRangeDuration(timeRangeDuration);
    };

    const onTimeRangeClick = (timeRange: TimeRange): void => {
        if (timeRange === TimeRange.CUSTOM) {
            // Custom time range duration to be set
            initCustomTimeRange();

            return;
        }

        // Update component state time range duration to selected time range
        setTimeRangeDuration(getTimeRangeDuration(timeRange));
    };

    const onStartDateChange = (date: MaterialUiPickersDate): void => {
        if (!date) {
            return;
        }

        // Custom time range duration to be set
        const customTimeRangeDuration = cloneDeep(timeRangeDuration);
        customTimeRangeDuration.timeRange = TimeRange.CUSTOM;
        customTimeRangeDuration.startTime = date.toMillis();

        // Make sure endTime is later or at least equal to the startTime
        if (
            customTimeRangeDuration.endTime -
                customTimeRangeDuration.startTime <
            0
        ) {
            customTimeRangeDuration.endTime = customTimeRangeDuration.startTime;
        }

        // Update component state time range duration
        setTimeRangeDuration(customTimeRangeDuration);
    };

    const onEndDateChange = (date: MaterialUiPickersDate): void => {
        if (!date) {
            return;
        }

        // Custom time range duration to be set
        const customTimeRangeDuration = cloneDeep(timeRangeDuration);
        customTimeRangeDuration.timeRange = TimeRange.CUSTOM;
        customTimeRangeDuration.endTime = date.toMillis();

        // Update component state time range duration
        setTimeRangeDuration(customTimeRangeDuration);
    };

    const onApply = (): void => {
        // Notify that component state time range duration has changed
        props.onChange &&
            props.onChange(
                timeRangeDuration.timeRange,
                timeRangeDuration.startTime,
                timeRangeDuration.endTime
            );

        closeTimeRangeSelector();
    };

    const closeTimeRangeSelector = (): void => {
        // Discard any changes to component state time range
        setTimeRangeDuration(props.getTimeRangeDuration());

        setTimeRangeSelectorAnchorElement(null);
    };

    const initCustomTimeRange = (): void => {
        if (timeRangeDuration.timeRange === TimeRange.CUSTOM) {
            // Component state time range duration is already of custom type, do nothing
            return;
        }

        // Start with setting TimeRangeType.TODAY as custom time range duration
        const customTimeRangeDuration = getTimeRangeDuration(TimeRange.TODAY);
        customTimeRangeDuration.timeRange = TimeRange.CUSTOM;

        // Update component state time range duration
        setTimeRangeDuration(customTimeRangeDuration);
    };

    return (
        <Grid container alignItems="center">
            {/* Time range */}
            <Grid item>
                {(timeRangeDuration.timeRange === TimeRange.CUSTOM &&
                    // Render time range duration
                    renderTimeRangeDuration(timeRangeDuration)) ||
                    (timeRangeDuration.timeRange &&
                        // Render time range name
                        renderTimeRange(timeRangeDuration.timeRange))}
            </Grid>

            {/* Time range button */}
            <Grid item>
                <Button
                    className={timeRangeSelectorClasses.timeRangeButton}
                    color="primary"
                    variant="outlined"
                    onClick={onTimeRangeButtonClick}
                >
                    <CalendarToday />
                </Button>

                {/* Time range selector */}
                <Popover
                    anchorEl={timeRangeSelectorAnchorElement}
                    open={Boolean(timeRangeSelectorAnchorElement)}
                    onClose={closeTimeRangeSelector}
                    onEnter={onTimeRangeSelectorOpen}
                >
                    <div
                        className={
                            timeRangeSelectorClasses.timeRangeSelectorContainer
                        }
                    >
                        <Grid container direction="column" spacing={0}>
                            {/* Header */}
                            <Grid item>
                                <Box
                                    border={Dimension.WIDTH_BORDER_DEFAULT}
                                    borderColor={Palette.COLOR_BORDER_DEFAULT}
                                    borderLeft={0}
                                    borderRight={0}
                                    borderTop={0}
                                    className={
                                        timeRangeSelectorClasses.timeRangeSelectorChildContainer
                                    }
                                >
                                    <Typography variant="h6">
                                        {t("label.customize-time-range")}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid container item spacing={0}>
                                {/* Time range selection */}
                                <Grid item>
                                    <Box
                                        border={Dimension.WIDTH_BORDER_DEFAULT}
                                        borderBottom={0}
                                        borderColor={
                                            Palette.COLOR_BORDER_DEFAULT
                                        }
                                        borderLeft={0}
                                        borderTop={0}
                                        className={
                                            timeRangeSelectorClasses.timeRangeList
                                        }
                                    >
                                        <List dense>
                                            {/* Recent custom time ranges label */}
                                            {props.recentCustomTimeRangeDurations &&
                                                props
                                                    .recentCustomTimeRangeDurations
                                                    .length > 0 && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={t(
                                                                "label.recent-custom"
                                                            )}
                                                            primaryTypographyProps={{
                                                                variant:
                                                                    "overline",
                                                            }}
                                                        />
                                                    </ListItem>
                                                )}

                                            {/* Recent custom time ranges */}
                                            {props.recentCustomTimeRangeDurations &&
                                                props.recentCustomTimeRangeDurations.map(
                                                    (
                                                        recentTimeRangeDuration,
                                                        index
                                                    ) => (
                                                        <ListItem
                                                            button
                                                            key={index}
                                                            onClick={(): void => {
                                                                onRecentCustomTimeRangeDurationClick(
                                                                    recentTimeRangeDuration
                                                                );
                                                            }}
                                                        >
                                                            <Tooltip
                                                                arrow
                                                                placement="right"
                                                                title={renderTimeRangeDuration(
                                                                    recentTimeRangeDuration
                                                                )}
                                                            >
                                                                <ListItemText
                                                                    primary={renderTimeRangeDuration(
                                                                        recentTimeRangeDuration
                                                                    )}
                                                                    primaryTypographyProps={{
                                                                        variant:
                                                                            "button",
                                                                        color:
                                                                            "primary",
                                                                        className:
                                                                            timeRangeSelectorClasses.timeRangeListItem,
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </ListItem>
                                                    )
                                                )}

                                            {props.recentCustomTimeRangeDurations &&
                                                props
                                                    .recentCustomTimeRangeDurations
                                                    .length > 0 && <Divider />}

                                            {/* Time ranges */}
                                            {Object.values(TimeRange)
                                                // Iterate through available TimeRange values
                                                .filter(
                                                    // Filter string values
                                                    (timeRange) =>
                                                        typeof timeRange ===
                                                        "string"
                                                )
                                                .map((timeRange) => (
                                                    <ListItem
                                                        button
                                                        key={timeRange}
                                                        onClick={(): void => {
                                                            onTimeRangeClick(
                                                                timeRange
                                                            );
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={renderTimeRange(
                                                                timeRange
                                                            )}
                                                            primaryTypographyProps={{
                                                                variant:
                                                                    "button",
                                                                color:
                                                                    "primary",
                                                                className:
                                                                    timeRangeDuration.timeRange ===
                                                                    timeRange
                                                                        ? classnames(
                                                                              timeRangeSelectorClasses.selectedTimeRange,
                                                                              timeRangeSelectorClasses.timeRangeListItem
                                                                          )
                                                                        : timeRangeSelectorClasses.timeRangeListItem,
                                                            }}
                                                        />
                                                    </ListItem>
                                                ))}
                                        </List>
                                    </Box>
                                </Grid>

                                <Grid item>
                                    <Grid
                                        container
                                        direction="column"
                                        spacing={0}
                                    >
                                        {/* Calendars */}
                                        <Grid container item spacing={0}>
                                            <MuiPickersUtilsProvider
                                                utils={LuxonUtils}
                                            >
                                                {/* Start time calendar */}
                                                <Grid item>
                                                    <DateTimePicker
                                                        disableFuture
                                                        hideTabs
                                                        value={
                                                            new Date(
                                                                timeRangeDuration.startTime as number
                                                            )
                                                        }
                                                        variant="static"
                                                        onChange={
                                                            onStartDateChange
                                                        }
                                                    />
                                                </Grid>

                                                {/* End time calendar */}
                                                <Grid item>
                                                    <DateTimePicker
                                                        disableFuture
                                                        hideTabs
                                                        minDate={
                                                            new Date(
                                                                timeRangeDuration.startTime as number
                                                            )
                                                        }
                                                        value={
                                                            new Date(
                                                                timeRangeDuration.endTime as number
                                                            )
                                                        }
                                                        variant="static"
                                                        onChange={
                                                            onEndDateChange
                                                        }
                                                    />
                                                </Grid>
                                            </MuiPickersUtilsProvider>
                                        </Grid>

                                        {/* Controls */}
                                        <Grid
                                            container
                                            item
                                            className={
                                                timeRangeSelectorClasses.timeRangeSelectorChildContainer
                                            }
                                        >
                                            {/* Apply */}
                                            <Grid item>
                                                <Button
                                                    color="primary"
                                                    size="large"
                                                    variant="contained"
                                                    onClick={onApply}
                                                >
                                                    {t("label.apply")}
                                                </Button>
                                            </Grid>

                                            {/* Cancel */}
                                            <Grid item>
                                                <Button
                                                    color="primary"
                                                    size="large"
                                                    variant="outlined"
                                                    onClick={
                                                        closeTimeRangeSelector
                                                    }
                                                >
                                                    {t("label.cancel")}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                </Popover>
            </Grid>
        </Grid>
    );
};