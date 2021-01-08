import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { PageContainer } from "../../components/page-container/page-container.component";
import { AppRoute, getAlertsPath } from "../../utils/routes-util/routes-util";
import { AlertsRouter } from "./alerts-router";

jest.mock("../../store/app-breadcrumbs-store/app-breadcrumbs-store", () => ({
    useAppBreadcrumbsStore: jest.fn().mockImplementation((selector) => {
        return selector({
            setAppSectionBreadcrumbs: mockSetAppSectionBreadcrumbs,
        });
    }),
}));

jest.mock("../../store/app-toolbar-store/app-toolbar-store", () => ({
    useAppToolbarStore: jest.fn().mockImplementation((selector) => {
        return selector({
            removeAppToolbar: mockRemoveAppToolbar,
        });
    }),
}));

jest.mock("react-i18next", () => ({
    useTranslation: jest.fn().mockReturnValue({
        t: (key: string): string => {
            return key;
        },
    }),
}));

jest.mock("../../components/page-container/page-container.component", () => ({
    PageContainer: jest.fn().mockImplementation(() => <>testPageContainer</>),
}));

jest.mock("../../pages/alerts-all-page/alerts-all-page.component", () => ({
    AlertsAllPage: jest.fn().mockImplementation(() => <>testAlertsAllPage</>),
}));

jest.mock(
    "../../pages/alerts-detail-page/alerts-detail-page.component",
    () => ({
        AlertsDetailPage: jest
            .fn()
            .mockImplementation(() => <>testAlertsDetailPage</>),
    })
);

jest.mock(
    "../../pages/alerts-create-page/alerts-create-page.component",
    () => ({
        AlertsCreatePage: jest
            .fn()
            .mockImplementation(() => <>testAlertsCreatePage</>),
    })
);

jest.mock(
    "../../pages/alerts-update-page/alerts-update-page.component",
    () => ({
        AlertsUpdatePage: jest
            .fn()
            .mockImplementation(() => <>testAlertsUpdatePage</>),
    })
);

jest.mock(
    "../../pages/page-not-found-page/page-not-found-page.component",
    () => ({
        PageNotFoundPage: jest
            .fn()
            .mockImplementation(() => <>testPageNotFoundPage</>),
    })
);

describe("Alerts Router", () => {
    test("should have rendered page container while loading", () => {
        render(
            <MemoryRouter>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(PageContainer).toHaveBeenCalled();
    });

    test("should set appropriate app section breadcrumbs", () => {
        render(
            <MemoryRouter>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(mockSetAppSectionBreadcrumbs).toHaveBeenCalledWith([
            {
                text: "label.alerts",
                pathFn: getAlertsPath,
            },
        ]);
    });

    test("should remove app toolbar", () => {
        render(
            <MemoryRouter>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(mockRemoveAppToolbar).toHaveBeenCalled();
    });

    test("should render alerts all page at exact alerts path", () => {
        render(
            <MemoryRouter initialEntries={[AppRoute.ALERTS]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testAlertsAllPage")).toBeInTheDocument();
    });

    test("should render page not found page at invalid alerts path", () => {
        render(
            <MemoryRouter initialEntries={[`${AppRoute.ALERTS}/testPath`]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });

    test("should render alerts all page at exact alerts all path", () => {
        render(
            <MemoryRouter initialEntries={[AppRoute.ALERTS_ALL]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testAlertsAllPage")).toBeInTheDocument();
    });

    test("should render page not found page at invalid alerts all path", () => {
        render(
            <MemoryRouter initialEntries={[`${AppRoute.ALERTS_ALL}/testPath`]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });

    test("should render alerts detail page at exact alerts detail path", () => {
        render(
            <MemoryRouter initialEntries={[AppRoute.ALERTS_DETAIL]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testAlertsDetailPage")).toBeInTheDocument();
    });

    test("should render page not found page at invalid alerts detail path", () => {
        render(
            <MemoryRouter
                initialEntries={[`${AppRoute.ALERTS_DETAIL}/testPath`]}
            >
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });

    test("should render alerts create page at exact alerts create path", () => {
        render(
            <MemoryRouter initialEntries={[AppRoute.ALERTS_CREATE]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testAlertsCreatePage")).toBeInTheDocument();
    });

    test("should render page not found page at invalid alerts create path", () => {
        render(
            <MemoryRouter
                initialEntries={[`${AppRoute.ALERTS_CREATE}/testPath`]}
            >
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });

    test("should render alerts update page at exact alerts update path", () => {
        render(
            <MemoryRouter initialEntries={[AppRoute.ALERTS_UPDATE]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testAlertsUpdatePage")).toBeInTheDocument();
    });

    test("should render page not found page at invalid alerts update path", () => {
        render(
            <MemoryRouter
                initialEntries={[`${AppRoute.ALERTS_UPDATE}/testPath`]}
            >
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });

    test("should render page not found page at any other path", () => {
        render(
            <MemoryRouter initialEntries={["/testPath"]}>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });

    test("should render page not found page by default", () => {
        render(
            <MemoryRouter>
                <AlertsRouter />
            </MemoryRouter>
        );

        expect(screen.getByText("testPageNotFoundPage")).toBeInTheDocument();
    });
});

const mockSetAppSectionBreadcrumbs = jest.fn();

const mockRemoveAppToolbar = jest.fn();