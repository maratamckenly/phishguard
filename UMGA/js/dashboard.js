/* =========================================================
   PHISHGUARD - ADMIN DASHBOARD
   Full replacement for: js/dashboard.js
   ========================================================= */

(function () {
    "use strict";

    console.log("PHISHGUARD DASHBOARD: initializing...");

    /* =========================================================
       CHECK SUPABASE
       ========================================================= */

    if (typeof supabaseClient === "undefined" || !supabaseClient) {
        console.error("PHISHGUARD: Supabase client is unavailable.");
        return;
    }

    console.log("PHISHGUARD: Supabase client ready.");


    /* =========================================================
       DOM ELEMENTS
       ========================================================= */

    const totalCampaignsEl = document.getElementById("totalCampaigns");
    const totalClicksEl = document.getElementById("totalClicks");
    const activeCampaignsEl = document.getElementById("activeCampaigns");

    const facebookClicksEl = document.getElementById("facebookClicks");
    const instagramClicksEl = document.getElementById("instagramClicks");
    const tiktokClicksEl = document.getElementById("tiktokClicks");
    const twitterClicksEl = document.getElementById("twitterClicks");

    const activityListEl = document.getElementById("activityList");

    const refreshButton = document.getElementById("refreshButton");
    const logoutButton = document.getElementById("logoutButton");
    const menuButton = document.getElementById("menuButton");

    const adminEmailEl = document.getElementById("adminEmail");


    /* =========================================================
       HELPER FUNCTIONS
       ========================================================= */

    function setText(element, value) {
        if (element) {
            element.textContent = String(value);
        }
    }


    function formatDate(dateValue) {
        if (!dateValue) {
            return "Unknown time";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Unknown time";
        }

        return date.toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }


    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getPlatformIcon(platform) {
        const value = String(platform || "").toLowerCase();

        if (value === "facebook") {
            return '<i class="fa-brands fa-facebook-f"></i>';
        }

        if (value === "instagram") {
            return '<i class="fa-brands fa-instagram"></i>';
        }

        if (value === "tiktok") {
            return '<i class="fa-brands fa-tiktok"></i>';
        }

        if (
            value === "twitter" ||
            value === "x" ||
            value === "x/twitter"
        ) {
            return '<i class="fa-brands fa-x-twitter"></i>';
        }

        return '<i class="fa-solid fa-arrow-pointer"></i>';
    }


    function normalizePlatform(platform) {
        const value = String(platform || "").toLowerCase().trim();

        if (value === "facebook") {
            return "facebook";
        }

        if (value === "instagram") {
            return "instagram";
        }

        if (value === "tiktok") {
            return "tiktok";
        }

        if (
            value === "twitter" ||
            value === "x" ||
            value === "x/twitter"
        ) {
            return "twitter";
        }

        return value || "unknown";
    }


    /* =========================================================
       DASHBOARD HELPERS
       ========================================================= */

    function normalizeDashboardValue(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /[\s-]+/g,
                "_"
            );

    }


    function formatDashboardPlatform(
        value
    ) {

        const platform =
            normalizeDashboardValue(
                value
            );


        const names = {

            facebook: "Facebook",

            instagram: "Instagram",

            tiktok: "TikTok",

            twitter: "X / Twitter"

        };


        return (
            names[platform] ||
            value ||
            "Unknown"
        );

    }


    function formatDashboardScenario(
        value
    ) {

        const scenario =
            normalizeDashboardValue(
                value
            );


        const names = {

            urgency: "Urgency",

            threat: "Threat",

            account_warning: "Account Warning",

            fake_giveaway: "Fake Giveaway",

            security_alert: "Security Alert",

            delivery: "Delivery",

            financial_alert: "Financial Alert",

            giveaway: "Giveaway",

            prize: "Prize",

            payment: "Payment",

            verification: "Verification",

            password_reset: "Password Reset",

            suspicious_login: "Suspicious Login"

        };


        return (
            names[scenario] ||
            value ||
            "Campaign"
        );

    }


    function getDashboardPlatformIcon(
        platform
    ) {

        const icons = {

            facebook:
                "fa-brands fa-facebook-f",

            instagram:
                "fa-brands fa-instagram",

            tiktok:
                "fa-brands fa-tiktok",

            twitter:
                "fa-brands fa-x-twitter"

        };


        return (
            icons[platform] ||
            "fa-solid fa-globe"
        );

    }


    function getDashboardScenarioIcon(
        scenario
    ) {

        const icons = {

            urgency:
                "fa-solid fa-bolt",

            threat:
                "fa-solid fa-triangle-exclamation",

            account_warning:
                "fa-solid fa-user-shield",

            fake_giveaway:
                "fa-solid fa-gift",

            security_alert:
                "fa-solid fa-shield-halved",

            delivery:
                "fa-solid fa-box",

            financial_alert:
                "fa-solid fa-credit-card",

            giveaway:
                "fa-solid fa-gift",

            prize:
                "fa-solid fa-trophy",

            payment:
                "fa-solid fa-receipt",

            verification:
                "fa-solid fa-user-check",

            password_reset:
                "fa-solid fa-key",

            suspicious_login:
                "fa-solid fa-location-dot"

        };


        return (
            icons[scenario] ||
            "fa-solid fa-circle-info"
        );

    }


    function formatDashboardDate(
        value
    ) {

        if (!value) {
            return "Unknown date";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Unknown date";
        }


        return date.toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    }


    function escapeDashboardHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================================
       LOAD CURRENT ADMIN
       ========================================================= */

    async function loadCurrentAdmin() {
        try {
            const {
                data: {
                    user
                },
                error
            } = await supabaseClient.auth.getUser();

            if (error) {
                console.warn(
                    "PHISHGUARD: Could not retrieve authenticated user.",
                    error
                );
                return;
            }

            if (!user) {
                console.warn(
                    "PHISHGUARD: No authenticated user found."
                );
                return;
            }

            console.log(
                "PHISHGUARD: authenticated:",
                user.email
            );

            if (adminEmailEl) {
                adminEmailEl.textContent =
                    user.email || "Administrator";
            }

        } catch (error) {
            console.error(
                "PHISHGUARD: Error loading admin:",
                error
            );
        }
    }


    /* =========================================================
       LOAD CAMPAIGN STATISTICS
       ========================================================= */

    async function loadCampaignStatistics() {
        console.log(
            "PHISHGUARD: Loading campaign statistics..."
        );

        try {

            /* -------------------------------------------------
               TOTAL CAMPAIGNS
               ------------------------------------------------- */

            const {
                count: campaignCount,
                error: campaignCountError
            } = await supabaseClient
                .from("campaigns")
                .select("id", {
                    count: "exact",
                    head: true
                });

            if (campaignCountError) {
                console.error(
                    "PHISHGUARD: Campaign count error:",
                    campaignCountError
                );
            } else {
                setText(
                    totalCampaignsEl,
                    campaignCount || 0
                );
            }


            /* -------------------------------------------------
               ACTIVE CAMPAIGNS
               ------------------------------------------------- */

            const {
                count: activeCount,
                error: activeError
            } = await supabaseClient
                .from("campaigns")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("active", true);

            if (activeError) {
                console.error(
                    "PHISHGUARD: Active campaign error:",
                    activeError
                );

                /*
                 * If the active column is unavailable,
                 * don't break the entire dashboard.
                 */
            } else {
                setText(
                    activeCampaignsEl,
                    activeCount || 0
                );
            }


            /* -------------------------------------------------
               TOTAL CLICKS
               ------------------------------------------------- */

            const {
                count: clickCount,
                error: clickCountError
            } = await supabaseClient
                .from("click_events")
                .select("id", {
                    count: "exact",
                    head: true
                });

            if (clickCountError) {
                console.error(
                    "PHISHGUARD: Click count error:",
                    clickCountError
                );
            } else {
                setText(
                    totalClicksEl,
                    clickCount || 0
                );
            }


            console.log(
                "PHISHGUARD: Statistics loaded."
            );

        } catch (error) {
            console.error(
                "PHISHGUARD: Statistics loading failed:",
                error
            );
        }
    }


    /* =========================================================
       LOAD PLATFORM CLICKS
       ========================================================= */

    async function loadPlatformClicks() {
        console.log(
            "PHISHGUARD: Loading platform clicks..."
        );

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("click_events")
                .select("platform");

            if (error) {
                console.error(
                    "PHISHGUARD: Platform click error:",
                    error
                );
                return;
            }

            const counts = {
                facebook: 0,
                instagram: 0,
                tiktok: 0,
                twitter: 0
            };


            (data || []).forEach(function (row) {

                const platform =
                    normalizePlatform(row.platform);

                if (
                    Object.prototype.hasOwnProperty.call(
                        counts,
                        platform
                    )
                ) {
                    counts[platform]++;
                }

            });


            setText(
                facebookClicksEl,
                counts.facebook
            );

            setText(
                instagramClicksEl,
                counts.instagram
            );

            setText(
                tiktokClicksEl,
                counts.tiktok
            );

            setText(
                twitterClicksEl,
                counts.twitter
            );


            console.log(
                "PHISHGUARD: Platform clicks:",
                counts
            );

        } catch (error) {
            console.error(
                "PHISHGUARD: Platform loading failed:",
                error
            );
        }
    }


    /* =========================================================
       LOAD RECENT ACTIVITY
       ========================================================= */

    async function loadRecentActivity() {
        console.log(
            "PHISHGUARD: Loading recent activity..."
        );

        if (!activityListEl) {
            return;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("click_events")
                .select(
                    "id, campaign_id, participant_id, platform, scenario_type, clicked_at, awareness_shown"
                )
                .order("clicked_at", {
                    ascending: false
                })
                .limit(8);


            if (error) {
                console.error(
                    "PHISHGUARD: Activity loading error:",
                    error
                );

                showActivityError();
                return;
            }


            if (!data || data.length === 0) {
                showEmptyActivity();
                return;
            }


            renderActivity(data);

            console.log(
                "PHISHGUARD: Recent activity loaded:",
                data.length
            );

        } catch (error) {
            console.error(
                "PHISHGUARD: Recent activity failed:",
                error
            );

            showActivityError();
        }
    }


    /* =========================================================
       RENDER EMPTY ACTIVITY
       ========================================================= */

    function showEmptyActivity() {

        activityListEl.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-inbox"></i>
                </div>

                <strong>
                    No activity yet
                </strong>

                <span>
                    Simulation interactions will appear here.
                </span>

            </div>
        `;
    }


    /* =========================================================
       RENDER ACTIVITY ERROR
       ========================================================= */

    function showActivityError() {

        activityListEl.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <strong>
                    Unable to load activity
                </strong>

                <span>
                    Please refresh the dashboard and try again.
                </span>

            </div>
        `;
    }


    /* =========================================================
       RENDER RECENT ACTIVITY
       ========================================================= */

    function renderActivity(events) {

        activityListEl.innerHTML = "";

        events.forEach(function (event) {

            const platform =
                normalizePlatform(event.platform);

            let platformName = "Unknown platform";

            if (platform === "facebook") {
                platformName = "Facebook";
            } else if (platform === "instagram") {
                platformName = "Instagram";
            } else if (platform === "tiktok") {
                platformName = "TikTok";
            } else if (platform === "twitter") {
                platformName = "X / Twitter";
            } else if (event.platform) {
                platformName = event.platform;
            }


            const scenario =
                event.scenario_type
                    ? event.scenario_type
                    : "simulation";


            const item = document.createElement("div");

            item.className = "activity-item";


            item.innerHTML = `
                <div class="activity-icon">
                    ${getPlatformIcon(platform)}
                </div>

                <div class="activity-info">

                    <strong>
                        ${escapeHTML(platformName)}
                    </strong>

                    <span>
                        ${escapeHTML(
                            scenario.replace(/_/g, " ")
                        )}
                    </span>

                </div>

                <div class="activity-time">
                    ${escapeHTML(
                        formatDate(event.clicked_at)
                    )}
                </div>
            `;


            activityListEl.appendChild(item);

        });
    }


    /* =========================================================
       CAMPAIGN OVERVIEW
       ========================================================= */

    async function loadCampaignOverview() {

        const container =
            document.getElementById(
                "campaignOverviewList"
            );

        if (!container) {
            return;
        }


        container.innerHTML = `

            <div class="campaign-loading">

                <div class="loading-mini"></div>

                <span>
                    Loading campaigns...
                </span>

            </div>

        `;


        try {

            const {
                data,
                error
            } = await supabaseClient

                .from("campaigns")

                .select(`
                    id,
                    campaign_name,
                    platform,
                    scenario_type,
                    active,
                    created_at
                `)

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )

                .limit(6);


            if (error) {

                console.error(
                    "Campaign overview error:",
                    error
                );

                container.innerHTML = `

                    <div class="campaign-empty">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        <strong>
                            Unable to load campaigns
                        </strong>

                        <span>
                            Please refresh the dashboard.
                        </span>

                    </div>

                `;

                return;
            }


            if (!data || data.length === 0) {

                container.innerHTML = `

                    <div class="campaign-empty">

                        <div class="campaign-empty-icon">

                            <i class="fa-solid fa-bullseye"></i>

                        </div>

                        <strong>
                            No campaigns yet
                        </strong>

                        <span>
                            Create your first campaign
                            to see it here.
                        </span>

                    </div>

                `;

                return;
            }


            /* =================================================
               GET CLICK COUNTS
            ================================================= */

            const campaignIds =
                data.map(
                    campaign => campaign.id
                );


            const {
                data: clickData,
                error: clickError
            } = await supabaseClient

                .from("click_events")

                .select(`
                    campaign_id
                `)

                .in(
                    "campaign_id",
                    campaignIds
                );


            if (clickError) {

                console.warn(
                    "Campaign click count error:",
                    clickError
                );

            }


            const clickCounts = {};


            (clickData || []).forEach(
                event => {

                    const id =
                        event.campaign_id;

                    clickCounts[id] =
                        (clickCounts[id] || 0) + 1;

                }
            );


            /* =================================================
               RENDER
            ================================================= */

            container.innerHTML =
                data.map(
                    campaign =>
                        buildCampaignOverviewItem(
                            campaign,
                            clickCounts[
                                campaign.id
                            ] || 0
                        )
                ).join("");

            attachCampaignOverviewEvents();

        }
        catch (error) {

            console.error(
                "Campaign overview failed:",
                error
            );

            container.innerHTML = `

                <div class="campaign-empty">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <strong>
                        Unable to load campaigns
                    </strong>

                </div>

            `;

        }

    }


    /* =========================================================
       CAMPAIGN OVERVIEW ITEM
       ========================================================= */

    function buildCampaignOverviewItem(
        campaign,
        clicks
    ) {

        const platform =
            normalizeDashboardValue(
                campaign.platform
            );

        const scenario =
            normalizeDashboardValue(
                campaign.scenario_type
            );


        const platformIcon =
            getDashboardPlatformIcon(
                platform
            );


        const scenarioIcon =
            getDashboardScenarioIcon(
                scenario
            );


        const scenarioName =
            formatDashboardScenario(
                campaign.scenario_type
            );


        const platformName =
            formatDashboardPlatform(
                campaign.platform
            );


        const status =
            campaign.active
                ? "Active"
                : "Inactive";


        const statusClass =
            campaign.active
                ? "campaign-active"
                : "campaign-inactive";


        const created =
            formatDashboardDate(
                campaign.created_at
            );


        return `

            <div
                class="campaign-overview-item campaign-clickable"
                data-campaign-id="${escapeDashboardHTML(
                    campaign.id
                )}"
            >

                <div class="campaign-main">

                    <div
                        class="
                            campaign-platform-icon
                            ${platform}
                        "
                    >

                        <i
                            class="${platformIcon}"
                        ></i>

                    </div>


                    <div class="campaign-info">

                        <strong>

                            ${escapeDashboardHTML(
                                campaign.campaign_name ||
                                "Untitled Campaign"
                            )}

                        </strong>


                        <div class="campaign-meta">

                            <span>

                                <i
                                    class="${scenarioIcon}"
                                ></i>

                                ${escapeDashboardHTML(
                                    scenarioName
                                )}

                            </span>


                            <span>
                                ${escapeDashboardHTML(
                                    platformName
                                )}
                            </span>

                        </div>

                    </div>

                </div>


                <div class="campaign-stats">

                    <div class="campaign-clicks">

                        <strong>
                            ${clicks}
                        </strong>

                        <span>
                            clicks
                        </span>

                    </div>


                    <span
                        class="
                            campaign-status
                            ${statusClass}
                        "
                    >

                        <span></span>

                        ${status}

                    </span>


                    <span class="campaign-date">

                        ${created}

                    </span>

                </div>

            </div>

        `;

    }


    /* =========================================================
       CAMPAIGN OVERVIEW CLICK
       ========================================================= */

    function attachCampaignOverviewEvents() {

        const campaignItems =
            document.querySelectorAll(
                ".campaign-clickable"
            );


        campaignItems.forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        const campaignId =
                            item.dataset.campaignId;


                        if (!campaignId) {
                            return;
                        }


                        openCampaignDetails(
                            campaignId
                        );

                    }
                );

            }
        );

    }


    /* =========================================================
       OPEN CAMPAIGN DETAILS
       ========================================================= */

    function openCampaignDetails(
        campaignId
    ) {

        const params =
            new URLSearchParams();


        params.set(
            "campaign",
            campaignId
        );


        window.location.href =
            `campaign-details.html?${params.toString()}`;

    }


    /* =========================================================
       REFRESH DASHBOARD
       ========================================================= */

    async function refreshDashboard() {

        console.log(
            "PHISHGUARD: Refreshing dashboard..."
        );

        if (refreshButton) {
            refreshButton.disabled = true;
            refreshButton.classList.add("loading");
        }


        try {

            await Promise.all([
                loadCampaignStatistics(),
                loadPlatformClicks(),
                loadRecentActivity(),
                loadCampaignOverview()
            ]);

            console.log(
                "PHISHGUARD: Dashboard refreshed."
            );

        } catch (error) {

            console.error(
                "PHISHGUARD: Refresh failed:",
                error
            );

        } finally {

            if (refreshButton) {
                refreshButton.disabled = false;
                refreshButton.classList.remove("loading");
            }

        }
    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    async function logout() {

        console.log(
            "PHISHGUARD: Signing out..."
        );

        try {

            const {
                error
            } = await supabaseClient.auth.signOut();

            if (error) {
                console.error(
                    "PHISHGUARD: Sign out error:",
                    error
                );

                return;
            }


            window.location.href = "index.html";

        } catch (error) {

            console.error(
                "PHISHGUARD: Logout failed:",
                error
            );

        }
    }


    /* =========================================================
       MOBILE SIDEBAR
       ========================================================= */

    function setupMobileMenu() {

        if (!menuButton) {
            return;
        }

        const sidebar =
            document.getElementById("sidebar");

        if (!sidebar) {
            return;
        }


        menuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );
    }


    /* =========================================================
       CREATE CAMPAIGN BUTTON
       ========================================================= */

    function setupCreateCampaignButton() {

        const button =
            document.getElementById("createCampaignButton");

        if (!button) {
            console.warn(
                "PHISHGUARD: Create Campaign button not found."
            );

            return;
        }

        button.type = "button";

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                console.log(
                    "PHISHGUARD: Opening Campaign Builder..."
                );

                window.location.href = "campaigns.html";

            }
        );
    }


    /* =========================================================
       REFRESH BUTTON
       ========================================================= */

    function setupRefreshButton() {

        if (!refreshButton) {
            return;
        }

        refreshButton.addEventListener(
            "click",
            refreshDashboard
        );
    }


    /* =========================================================
       LOGOUT BUTTON
       ========================================================= */

    function setupLogoutButton() {

        if (!logoutButton) {
            return;
        }

        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    /* =========================================================
       SUPABASE AUTH STATE
       ========================================================= */

    function setupAuthListener() {

        supabaseClient.auth.onAuthStateChange(
            function (event, session) {

                console.log(
                    "PHISHGUARD AUTH:",
                    event
                );

                if (
                    event === "SIGNED_IN" &&
                    session &&
                    session.user
                ) {

                    if (adminEmailEl) {
                        adminEmailEl.textContent =
                            session.user.email ||
                            "Administrator";
                    }

                }

            }
        );
    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    async function initializeDashboard() {

        console.log(
            "PHISHGUARD DASHBOARD: initializing..."
        );


        setupMobileMenu();
        setupCreateCampaignButton();
        setupRefreshButton();
        setupLogoutButton();
        setupAuthListener();


        await loadCurrentAdmin();

        await refreshDashboard();


        console.log(
            "PHISHGUARD DASHBOARD: ready."
        );
    }


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDashboard
        );

    } else {

        initializeDashboard();

    }

})();