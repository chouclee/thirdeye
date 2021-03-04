import { makeStyles } from "@material-ui/core";
import { Border } from "../../utils/material-ui/border.util";

export const useErrorIndicatorStyles = makeStyles((theme) => ({
    errorIndicator: {
        height: "100%",
        width: "100%",
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        display: "flex",
        borderRight: Border.BORDER_DEFAULT,
        paddingRight: theme.spacing(2),
    },
    text: {
        paddingLeft: theme.spacing(2),
    },
}));