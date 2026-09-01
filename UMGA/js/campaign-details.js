(function () {

    "use strict";

    /* =====================================================
       SUPABASE
       ===================================================== */

    const supabaseClient =
        window.phishguardSupabase;

    if (!supabaseClient) {
        console.error(
            "PHISHGUARD: Supabase client unavailable."
        );

        return;
    }


    /* =====================================================
       URL - STEP 16: Support both id and campaign params
       ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const campaignId =
        params.get("id") ||
        params.get("campaign");


    /* =====================================================
       DOM
       ===================================================== */

    const loadingState =
        document.getElementById(
            "loadingState"
        );


    const errorState =
        document.getElementById(
            "errorState"
        );


    const campaignDetails =
        document.getElementById(
            "campaignDetails"
        );


    const campaignName =
        document.getElementById(
            "campaignName"
        );


    const campaignDescription =
        document.getElementById(
            "campaignDescription"
        );


    const campaignStatus =
        document.getElementById(
            "campaignStatus"
        );


    const campaignClicks =
        document.getElementById(
            "campaignClicks"
        );


    const campaignPlatform =
        document.getElementById(
            "campaignPlatform"
        );


    const campaignScenario =
        document.getElementById(
            "campaignScenario"
        );


    const campaignCreated =
        document.getElementById(
            "campaignCreated"
        );


    const infoCampaignName =
        document.getElementById(
            "infoCampaignName"
        );


    const infoPlatform =
        document.getElementById(
            "infoPlatform"
        );


    const infoScenario =
        document.getElementById(
            "infoScenario"
        );


    const infoCreated =
        document.getElementById(
            "infoCreated"
        );


    const infoStatus =
        document.getElementById(
            "infoStatus"
        );


    const campaignActivity =
        document.getElementById(
            "campaignActivity"
        );


    const activityCount =
        document.getElementById(
            "activityCount"
        );


    const previewHeadline =
        document.getElementById(
            "previewHeadline"
        );


    const previewMessage =
        document.getElementById(
            "previewMessage"
        );


    const previewCTA =
        document.getElementById(
            "previewCTA"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    /* =====================================================
       TRACKING DOM REFERENCES
       ===================================================== */

    const trackingStatus =
        document.getElementById(
            "trackingStatus"
        );


    const trackingCode =
        document.getElementById(
            "trackingCode"
        );


    const trackingPlatform =
        document.getElementById(
            "trackingPlatform"
        );

const trackingClicks =
    document.getElementById("campaignClicks");


    const trackingLink =
        document.getElementById(
            "trackingLink"
        );


    const copyTrackingLink =
        document.getElementById(
            "copyTrackingLink"
        );


    const copyMessage =
        document.getElementById(
            "copyMessage"
        );


    /* =====================================================
       HELPERS
       ===================================================== */

    function setText(
        element,
        value
    ) {

        if (element) {

            element.textContent =
                String(
                    value ?? "—"
                );

        }

    }


    function escapeHTML(
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


    function normalize(
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


    function formatScenario(
        value
    ) {

        const scenario =
            normalize(value);


        const names = {

            urgency:
                "Urgency",

            threat:
                "Threat",

            account_warning:
                "Account Warning",

            fake_giveaway:
                "Fake Giveaway",

            security_alert:
                "Security Alert",

            delivery:
                "Delivery",

            financial_alert:
                "Financial Alert",

            giveaway:
                "Giveaway",

            prize:
                "Prize",

            payment:
                "Payment",

            verification:
                "Verification",

            password_reset:
                "Password Reset",

            suspicious_login:
                "Suspicious Login"

        };


        return (
            names[scenario] ||
            value ||
            "Campaign"
        );

    }


    function formatPlatform(
        value
    ) {

        const platform =
            normalize(value);


        const names = {

            facebook:
                "Facebook",

            instagram:
                "Instagram",

            tiktok:
                "TikTok",

            twitter:
                "X / Twitter",

            x:
                "X / Twitter"

        };


        return (
            names[platform] ||
            value ||
            "Unknown"
        );

    }


    function formatDate(
        value
    ) {

        if (!value) {
            return "Unknown";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Unknown";

        }


        return date.toLocaleString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }


    function formatShortDate(
        value
    ) {

        if (!value) {
            return "Unknown";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Unknown";

        }


        return date.toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    }


    /* =====================================================
       UI STATES
       ===================================================== */

    function showLoading() {

        if (loadingState) {

            loadingState.classList.remove(
                "hidden"
            );

        }


        if (errorState) {

            errorState.classList.add(
                "hidden"
            );

        }


        if (campaignDetails) {

            campaignDetails.classList.add(
                "hidden"
            );

        }

    }


    function showError() {

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (campaignDetails) {

            campaignDetails.classList.add(
                "hidden"
            );

        }


        if (errorState) {

            errorState.classList.remove(
                "hidden"
            );

        }

    }


    function showDetails() {

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }


        if (errorState) {

            errorState.classList.add(
                "hidden"
            );

        }


        if (campaignDetails) {

            campaignDetails.classList.remove(
                "hidden"
            );

        }

    }


    /* =====================================================
       LOAD CAMPAIGN
       ===================================================== */

    async function loadCampaign() {

        if (!campaignId) {

            console.error(
                "PHISHGUARD: No campaign ID."
            );

            showError();

            return;
        }


        showLoading();


        try {

            const {
                data: campaign,
                error
            } = await supabaseClient

                .from("campaigns")

                .select("*")

                .eq(
                    "id",
                    campaignId
                )

                .maybeSingle();


            if (error) {

                console.error(
                    "PHISHGUARD: Campaign query error:",
                    error
                );

                showError();

                return;
            }


            if (!campaign) {

                console.error(
                    "PHISHGUARD: Campaign not found."
                );

                showError();

                return;
            }


            await renderCampaign(
                campaign
            );

            showDetails();

        }


        catch (error) {

            console.error(
                "PHISHGUARD: Campaign loading failed:",
                error
            );

            showError();

        }

    }


    /* =====================================================
       RENDER CAMPAIGN
       ===================================================== */

    async function renderCampaign(
        campaign
    ) {

        const platform =
            formatPlatform(
                campaign.platform
            );


        const scenario =
            formatScenario(
                campaign.scenario_type
            );


        const status =
            campaign.active
                ? "Active"
                : "Inactive";


        const created =
            formatShortDate(
                campaign.created_at
            );


        setText(
            campaignName,
            campaign.campaign_name ||
            "Untitled Campaign"
        );


        setText(
            campaignDescription,
            `${scenario} campaign on ${platform}`
        );


        setText(
            campaignPlatform,
            platform
        );


        setText(
            campaignScenario,
            scenario
        );


        setText(
            campaignCreated,
            created
        );


        setText(
            infoCampaignName,
            campaign.campaign_name ||
            "Untitled Campaign"
        );


        setText(
            infoPlatform,
            platform
        );


        setText(
            infoScenario,
            scenario
        );


        setText(
            infoCreated,
            formatDate(
                campaign.created_at
            )
        );


        setText(
            infoStatus,
            status
        );


        if (campaignStatus) {

            campaignStatus.className =
                campaign.active
                    ? "campaign-status status-active"
                    : "campaign-status status-inactive";


            campaignStatus.innerHTML = `

                <span></span>

                ${status}

            `;

        }


        setText(
            previewHeadline,
            campaign.headline ||
            "No headline configured"
        );


        setText(
            previewMessage,
            campaign.message ||
            "No message configured"
        );


        setText(
            previewCTA,
            campaign.cta ||
            "No CTA configured"
        );


        await loadCampaignActivity();

        await loadTrackingInformation();

        await loadTrackingClickCount();

        setInterval(
            loadTrackingClickCount,
            5000
        );

    }


    /* =====================================================
       LOAD CAMPAIGN ACTIVITY
       ===================================================== */

    async function loadCampaignActivity() {

        if (!campaignActivity) {
            return;
        }


        campaignActivity.innerHTML = `

            <div class="activity-loading">

                <div class="loading-mini"></div>

                Loading activity...

            </div>

        `;


        try {

            const {
                data,
                error
            } = await supabaseClient

                .from("click_events")

                .select(`
                    id,
                    participant_id,
                    platform,
                    scenario_type,
                    clicked_at,
                    awareness_shown
                `)

                .eq(
                    "campaign_id",
                    campaignId
                )

                .order(
                    "clicked_at",
                    {
                        ascending: false
                    }
                )

                .limit(50);


            if (error) {

                console.error(
                    "PHISHGUARD: Activity query error:",
                    error
                );


                renderActivityError();

                return;
            }


            const events =
                data || [];


            // 19A - Update both activity count and total clicks
            setText(
                activityCount,
                events.length
            );

            setText(
                campaignClicks,
                events.length
            );


            if (
                events.length === 0
            ) {

                renderNoActivity();

                return;
            }


            renderCampaignActivity(
                events
            );

        }


        catch (error) {

            console.error(
                "PHISHGUARD: Activity loading failed:",
                error
            );


            renderActivityError();

        }

    }


    /* =====================================================
       RENDER ACTIVITY - 19B Updated display
       ===================================================== */

    function renderCampaignActivity(
        events
    ) {

        campaignActivity.innerHTML =
            events.map(
                event => {

                    const platform =
                        formatPlatform(
                            event.platform
                        );


                    const scenario =
                        formatScenario(
                            event.scenario_type
                        );


                    const time =
                        formatDate(
                            event.clicked_at
                        );


                    const awareness =
                        event.awareness_shown
                            ? "Awareness shown"
                            : "Interaction recorded";


                    return `

                        <div class="campaign-activity-item">

                            <div class="campaign-activity-icon">

                                <i class="fa-solid fa-arrow-pointer"></i>

                            </div>


                            <div class="campaign-activity-info">

                                <strong>
                                    Campaign interaction
                                </strong>

                                <span>
                                    ${escapeHTML(platform)}
                                    ·
                                    ${escapeHTML(scenario)}
                                </span>

                            </div>


                            <div class="campaign-activity-result">

                                <strong>
                                    ${escapeHTML(awareness)}
                                </strong>

                                <span>
                                    ${escapeHTML(time)}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       EMPTY ACTIVITY
       ===================================================== */

    function renderNoActivity() {

        campaignActivity.innerHTML = `

            <div class="activity-empty">

                <div class="activity-empty-icon">

                    <i class="fa-solid fa-inbox"></i>

                </div>


                <strong>
                    No interactions yet
                </strong>


                <span>
                    Campaign interactions will appear here.
                </span>

            </div>

        `;

    }


    /* =====================================================
       ACTIVITY ERROR
       ===================================================== */

    function renderActivityError() {

        campaignActivity.innerHTML = `

            <div class="activity-empty">

                <div class="activity-empty-icon error">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>


                <strong>
                    Unable to load activity
                </strong>


                <span>
                    Please refresh the page.
                </span>

            </div>

        `;

    }


    /* =====================================================
       LOAD TRACKING INFORMATION
       ===================================================== */

    async function loadTrackingInformation() {

        if (!campaignId) {
            return;
        }


        try {

            const {
                data,
                error
            } = await supabaseClient

                .from("tracking_links")

                .select(`
                    id,
                    campaign_id,
                    platform,
                    short_code,
                    created_at
                `)

                .eq(
                    "campaign_id",
                    campaignId
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )

                .limit(1)
                
                .maybeSingle();


            if (error) {

                console.error(
                    "PHISHGUARD: Tracking query error:",
                    error
                );

                renderTrackingUnavailable();

                return;
            }


            if (!data) {

                renderTrackingUnavailable();

                return;
            }


            renderTrackingInformation(
                data
            );

        }


        catch (error) {

            console.error(
                "PHISHGUARD: Tracking loading failed:",
                error
            );

            renderTrackingUnavailable();

        }

    }


    /* =====================================================
       RENDER TRACKING INFORMATION - STEP 17: Fixed campaign link
       ===================================================== */

    function renderTrackingInformation(
        tracking
    ) {

        if (trackingCode) {

            trackingCode.textContent =
                tracking.short_code ||
                "—";

        }


        if (trackingPlatform) {

            trackingPlatform.textContent =
                formatPlatform(
                    tracking.platform
                );

        }


        /* =====================================================
           BUILD PUBLIC CAMPAIGN URL - STEP 17
           ===================================================== */

        const publicLink =
            `${window.location.origin}${window.location.pathname
                .replace("campaign-details.html", "campaign.html")}?code=${encodeURIComponent(
                    tracking.short_code
                )}`;

        if (trackingLink) {
            trackingLink.value = publicLink;
        }


        /* =====================================================
           STATUS
           ===================================================== */

        if (trackingStatus) {

            const active = true;

            trackingStatus.className =
                active
                    ? "tracking-status tracking-active"
                    : "tracking-status tracking-inactive";

            trackingStatus.innerHTML = `
                <span></span>
                ${active
                    ? "ACTIVE"
                    : "INACTIVE"}
            `;

        }

    }


    /* =====================================================
       TRACKING UNAVAILABLE
       ===================================================== */

    function renderTrackingUnavailable() {

        if (trackingCode) {

            trackingCode.textContent =
                "Unavailable";

        }


        if (trackingPlatform) {

            trackingPlatform.textContent =
                "—";

        }


        if (trackingClicks) {

            trackingClicks.textContent =
                "Unavailable";

        }


        if (trackingLink) {

            trackingLink.value =
                "No tracking link available";

        }


        if (trackingStatus) {

            trackingStatus.className =
                "tracking-status tracking-inactive";


            trackingStatus.innerHTML = `

                <span></span>

                UNAVAILABLE

            `;

        }

    }


    /* =====================================================
       LOAD TRACKING CLICK COUNT - STEP 22 FIX
       ===================================================== */

    async function loadTrackingClickCount() {

        if (!trackingClicks || !campaignId) {
            return;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("click_events")
                .select("id")
                .eq(
                    "campaign_id",
                    campaignId
                );


            if (error) {

                console.error(
                    "PHISHGUARD: Click count query error:",
                    error
                );

                trackingClicks.textContent =
                    "Unavailable";

                return;
            }


            const totalClicks =
                Array.isArray(data)
                    ? data.length
                    : 0;


            trackingClicks.textContent =
                `${totalClicks} ${
                    totalClicks === 1
                        ? "click"
                        : "clicks"
                }`;


            console.log(
                "PHISHGUARD: Total clicks:",
                totalClicks
            );


        } catch (error) {

            console.error(
                "PHISHGUARD: Click count loading failed:",
                error
            );

            trackingClicks.textContent =
                "Unavailable";

        }

    }


    /* =====================================================
       COPY TRACKING LINK
       ===================================================== */

    async function copyCampaignLink() {

        if (
            !trackingLink ||
            !trackingLink.value
        ) {

            return;
        }


        try {

            await navigator.clipboard.writeText(
                trackingLink.value
            );


            if (copyMessage) {

                copyMessage.textContent =
                    "Campaign link copied.";

                copyMessage.classList.add(
                    "visible"
                );

            }


            if (copyTrackingLink) {

                copyTrackingLink.innerHTML = `

                    <i class="fa-solid fa-check"></i>

                    Copied

                `;

            }


            setTimeout(
                () => {

                    if (copyMessage) {

                        copyMessage.textContent =
                            "";

                        copyMessage.classList.remove(
                            "visible"
                        );

                    }


                    if (copyTrackingLink) {

                        copyTrackingLink.innerHTML = `

                            <i class="fa-regular fa-copy"></i>

                            Copy

                        `;

                    }

                },
                1800
            );

        }


        catch (error) {

            console.error(
                "PHISHGUARD: Copy failed:",
                error
            );


            if (trackingLink) {

                trackingLink.select();

            }

        }

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    async function logout() {

        try {

            const {
                error
            } = await supabaseClient
                .auth
                .signOut();


            if (error) {

                console.error(
                    "PHISHGUARD: Logout error:",
                    error
                );

                return;
            }


            window.location.href =
                "index.html";

        }


        catch (error) {

            console.error(
                "PHISHGUARD: Logout failed:",
                error
            );

        }

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }


    if (copyTrackingLink) {

        copyTrackingLink.addEventListener(
            "click",
            copyCampaignLink
        );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadCampaign
        );

    } else {

        loadCampaign();

    }

})();