/* =========================================================
   PHISHGUARD
   CAMPAIGN DISPLAY + AWARENESS FLOW
   ========================================================= */


/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const loadingState =
    document.getElementById("loadingState");

const simulationContainer =
    document.getElementById("simulationContainer");

const scenarioPlatform =
    document.getElementById("scenarioPlatform");

const phishingCard =
    document.getElementById("phishingCard");

const errorState =
    document.getElementById("errorState");


/* =========================================================
   CAMPAIGN ID
   ========================================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const campaignId =
    urlParams.get("campaign") ||
    urlParams.get("campaign_id");

const campaignCode =
    urlParams.get("code");


/* =========================================================
   STATE
   ========================================================= */

let currentCampaign = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCampaign();

    }
);


/* =========================================================
   LOAD CAMPAIGN
   ========================================================= */

async function loadCampaign() {

    showLoading();

    /* =====================================================
       CHECK SUPABASE
    ===================================================== */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "PHISHGUARD: Supabase client unavailable."
        );

        showError();

        return;
    }


    try {

        let resolvedCampaignId =
            campaignId;


        /* =================================================
           RESOLVE SHORT CODE
           
           URL:
           campaign.html?code=7XZW2UMP
        ================================================= */

        if (
            !resolvedCampaignId &&
            campaignCode
        ) {

            console.log(
                "PHISHGUARD: Resolving campaign code:",
                campaignCode
            );


            const {
                data: trackingLink,
                error: trackingError
            } = await supabaseClient

                .from("tracking_links")

                .select(`
                    id,
                    campaign_id,
                    platform,
                    short_code
                `)

                .eq(
                    "short_code",
                    campaignCode
                )

                .maybeSingle();


            if (trackingError) {

                console.error(
                    "PHISHGUARD: Tracking link lookup error:",
                    trackingError
                );

                showError();

                return;
            }


            if (!trackingLink) {

                console.error(
                    "PHISHGUARD: Invalid campaign code:",
                    campaignCode
                );

                showError();

                return;
            }


            resolvedCampaignId =
                trackingLink.campaign_id;


            console.log(
                "PHISHGUARD: Campaign ID resolved:",
                resolvedCampaignId
            );

        }


        /* =================================================
           NO CAMPAIGN IDENTIFIER
        ================================================= */

        if (!resolvedCampaignId) {

            console.error(
                "PHISHGUARD: No campaign ID or campaign code found."
            );

            showError();

            return;
        }


        /* =================================================
           LOAD CAMPAIGN
        ================================================= */

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
                headline,
                message,
                cta,
                tactic,
                warning_signs,
                active
            `)

            .eq(
                "id",
                resolvedCampaignId
            )

            .eq(
                "active",
                true
            )

            .maybeSingle();


        /* =================================================
           QUERY ERROR
        ================================================= */

        if (error) {

            console.error(
                "PHISHGUARD: Campaign query error:",
                error
            );

            showError();

            return;
        }


        /* =================================================
           CAMPAIGN NOT FOUND
        ================================================= */

        if (!data) {

            console.error(
                "PHISHGUARD: Campaign not found or inactive."
            );

            showError();

            return;
        }


        /* =================================================
           CAMPAIGN SUCCESS
        ================================================= */

        currentCampaign =
            data;


        console.log(
            "PHISHGUARD: Campaign loaded:",
            data
        );


        renderCampaign(
            data
        );

    }


    catch (error) {

        console.error(
            "PHISHGUARD: Campaign loading error:",
            error
        );

        showError();

    }

}


/* =========================================================
   RENDER CAMPAIGN
   ========================================================= */

function renderCampaign(campaign) {

    if (!campaign) {

        showError();

        return;
    }


    const platform =
        normalize(
            campaign.platform
        );

    const scenario =
        normalize(
            campaign.scenario_type
        );


    /* -----------------------------------------------------
       PLATFORM LABEL
    ----------------------------------------------------- */

    if (scenarioPlatform) {

        scenarioPlatform.textContent =
            formatPlatform(
                campaign.platform
            );

    }


    /* -----------------------------------------------------
       BUILD CONTENT
    ----------------------------------------------------- */

    if (!phishingCard) {

        console.error(
            "PHISHGUARD: phishingCard element missing."
        );

        return;
    }


    phishingCard.innerHTML =
        buildCampaignCard(
            campaign
        );


    /* -----------------------------------------------------
       CTA
    ----------------------------------------------------- */

    const cta =
        document.getElementById(
            "phishingCTA"
        );


    if (cta) {

        cta.addEventListener(
            "click",
            () => handleCampaignClick(campaign, cta)
        );

    }


    /* -----------------------------------------------------
       SHOW PAGE
    ----------------------------------------------------- */

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


    if (simulationContainer) {

        simulationContainer.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   BUILD CAMPAIGN CARD
   ========================================================= */

function buildCampaignCard(campaign) {

    const platform =
        normalize(campaign.platform);

    const scenario =
        normalize(campaign.scenario_type);

    const platformName =
        formatPlatformName(campaign.platform);

    const scenarioInfo =
        getScenarioInfo(scenario);

    const headline =
        campaign.headline ||
        scenarioInfo.headline;

    const message =
        campaign.message ||
        scenarioInfo.message;

    const cta =
        campaign.cta ||
        scenarioInfo.cta;

    const tactic =
        campaign.tactic ||
        scenarioInfo.tactic;

    const warningSigns =
        parseWarningSigns(campaign.warning_signs);

    const platformClass =
        getPlatformClass(platform);

    const scenarioClass =
        getScenarioClass(scenario);

    const detailBlock =
        buildScenarioDetails(
            scenario
        );


    return `

        <div
            class="
                phishing-card-header
                ${platformClass}
            "
        >

            <div class="phishing-profile">

                <div
                    class="
                        profile-avatar
                        ${platformClass}
                    "
                >

                    <i
                        class="${getPlatformIcon(platform)}"
                    ></i>

                </div>


                <div class="profile-info">

                    <strong>
                        ${escapeHTML(platformName)}
                    </strong>

                    <span>
                        ${escapeHTML(
                            scenarioInfo.header
                        )}
                    </span>

                </div>

            </div>


            <div class="notification-icon">

                <i
                    class="${scenarioInfo.icon}"
                ></i>

            </div>

        </div>


        <div
            class="
                phishing-card-content
                ${scenarioClass}
            "
        >

            <div
                class="
                    phishing-alert
                    ${scenarioClass}
                "
            >

                <i
                    class="${scenarioInfo.alertIcon}"
                ></i>

                <span>
                    ${escapeHTML(
                        scenarioInfo.alert
                    )}
                </span>

            </div>


            <h1 class="phishing-headline">

                ${escapeHTML(headline)}

            </h1>


            <p class="phishing-message">

                ${escapeHTML(message)}

            </p>


            ${detailBlock}


            <div class="message-context">

                <div class="context-item">

                    <span>
                        NOTICE
                    </span>

                    <strong>
                        ${escapeHTML(
                            scenarioInfo.notice
                        )}
                    </strong>

                </div>


                <div class="context-item">

                    <span>
                        STATUS
                    </span>

                    <strong class="status-warning">

                        ${escapeHTML(
                            scenarioInfo.status
                        )}

                    </strong>

                </div>

            </div>


            <button
                id="phishingCTA"
                class="phishing-cta"
                type="button"
            >

                <span>
                    ${escapeHTML(cta)}
                </span>

                <i
                    class="fa-solid fa-arrow-right"
                ></i>

            </button>


            <div class="phishing-meta">

                <span>

                    <i
                        class="fa-solid fa-clock"
                    ></i>

                    ${escapeHTML(
                        scenarioInfo.footerLeft
                    )}

                </span>


                <span>

                    <i
                        class="fa-solid fa-shield-halved"
                    ></i>

                    ${escapeHTML(
                        scenarioInfo.footerRight
                    )}

                </span>

            </div>


            <div
                class="campaign-hidden-data"
                aria-hidden="true"
            >

                <span>
                    ${escapeHTML(tactic)}
                </span>

                <span>
                    ${warningSigns
                        .map(
                            item =>
                                escapeHTML(item)
                        )
                        .join(" | ")
                    }
                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   BUILD SCENARIO DETAILS
   ========================================================= */

function buildScenarioDetails(
    scenario
) {

    switch (normalize(scenario)) {


        /* =================================================
           FINANCIAL
        ================================================= */

        case "financial_alert":
        case "payment":

            return `

                <div class="scenario-details financial-details">

                    <div class="scenario-details-heading">

                        <i class="fa-solid fa-receipt"></i>

                        <span>
                            RECENT ACTIVITY
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>
                            Activity
                        </span>

                        <strong>
                            Payment activity
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Status
                        </span>

                        <strong class="detail-warning">
                            Review requested
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Account
                        </span>

                        <strong>
                            Activity associated with your account
                        </strong>

                    </div>

                </div>

            `;


        /* =================================================
           DELIVERY
        ================================================= */

        case "delivery":

            return `

                <div class="scenario-details delivery-details">

                    <div class="scenario-details-heading">

                        <i class="fa-solid fa-box"></i>

                        <span>
                            DELIVERY UPDATE
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>
                            Shipment
                        </span>

                        <strong>
                            Delivery notification
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Status
                        </span>

                        <strong class="detail-warning">
                            Action requested
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Update
                        </span>

                        <strong>
                            Delivery requires attention
                        </strong>

                    </div>

                </div>

            `;


        /* =================================================
           GIVEAWAY / PRIZE
        ================================================= */

        case "fake_giveaway":
        case "giveaway":
        case "prize":

            return `

                <div class="scenario-details reward-details">

                    <div class="scenario-details-heading">

                        <i class="fa-solid fa-gift"></i>

                        <span>
                            REWARD DETAILS
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>
                            Selection
                        </span>

                        <strong>
                            Promotional selection
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Status
                        </span>

                        <strong class="detail-reward">
                            Available
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Notice
                        </span>

                        <strong>
                            Reward notification
                        </strong>

                    </div>

                </div>

            `;


        /* =================================================
           SECURITY / THREAT
        ================================================= */

        case "threat":
        case "security_alert":
        case "account_warning":
        case "suspicious_login":

            return `

                <div class="scenario-details security-details">

                    <div class="scenario-details-heading">

                        <i class="fa-solid fa-shield-halved"></i>

                        <span>
                            SECURITY ACTIVITY
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>
                            Activity
                        </span>

                        <strong>
                            Unrecognized activity
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Status
                        </span>

                        <strong class="detail-warning">
                            Review recommended
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Protection
                        </span>

                        <strong>
                            Account security review
                        </strong>

                    </div>

                </div>

            `;


        /* =================================================
           PASSWORD / VERIFICATION
        ================================================= */

        case "password_reset":
        case "verification":

            return `

                <div class="scenario-details verification-details">

                    <div class="scenario-details-heading">

                        <i class="fa-solid fa-user-shield"></i>

                        <span>
                            ACCOUNT REVIEW
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>
                            Request
                        </span>

                        <strong>
                            Account verification
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Status
                        </span>

                        <strong class="detail-warning">
                            Review requested
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Security
                        </span>

                        <strong>
                            Account protection
                        </strong>

                    </div>

                </div>

            `;


        /* =================================================
           URGENCY / DEFAULT
        ================================================= */

        default:

            return `

                <div class="scenario-details urgency-details">

                    <div class="scenario-details-heading">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        <span>
                            IMPORTANT NOTICE
                        </span>

                    </div>


                    <div class="detail-row">

                        <span>
                            Request
                        </span>

                        <strong>
                            Immediate attention
                        </strong>

                    </div>


                    <div class="detail-row">

                        <span>
                            Status
                        </span>

                        <strong class="detail-warning">
                            Action requested
                        </strong>

                    </div>

                </div>

            `;

    }

}


/* =========================================================
   SCENARIO INFORMATION
   ========================================================= */

function getScenarioInfo(
    scenario
) {

    const scenarios = {

        urgency: {

            header:
                "Important Notification",

            alert:
                "ACTION REQUIRED",

            alertIcon:
                "fa-solid fa-bolt",

            icon:
                "fa-solid fa-bell",

            notice:
                "Immediate action requested",

            status:
                "Action pending",

            footerLeft:
                "Review requested",

            footerRight:
                "Verify the source",

            headline:
                "Your attention is required",

            message:
                "A recent account notice requires your attention. Review the information carefully before taking any action.",

            cta:
                "Review Notification",

            tactic:
                "Urgency and pressure"

        },


        threat: {

            header:
                "Security Notice",

            alert:
                "SECURITY WARNING",

            alertIcon:
                "fa-solid fa-triangle-exclamation",

            icon:
                "fa-solid fa-shield-halved",

            notice:
                "Unusual activity detected",

            status:
                "Review recommended",

            footerLeft:
                "Security notice",

            footerRight:
                "Verify the source",

            headline:
                "Unusual activity requires your attention",

            message:
                "We noticed activity associated with your account that may require review. Check the source carefully before responding.",

            cta:
                "Review Activity",

            tactic:
                "Fear and urgency"

        },


        account_warning: {

            header:
                "Account Security",

            alert:
                "ACCOUNT WARNING",

            alertIcon:
                "fa-solid fa-user-shield",

            icon:
                "fa-solid fa-lock",

            notice:
                "Account review requested",

            status:
                "Review pending",

            footerLeft:
                "Account notice",

            footerRight:
                "Verify independently",

            headline:
                "Your account requires a security review",

            message:
                "A security-related notice has been associated with your account. Review the details and verify the source before proceeding.",

            cta:
                "Review Account",

            tactic:
                "Security impersonation"

        },


        security_alert: {

            header:
                "Security Center",

            alert:
                "SECURITY ALERT",

            alertIcon:
                "fa-solid fa-shield-halved",

            icon:
                "fa-solid fa-bell",

            notice:
                "Security activity detected",

            status:
                "Verification requested",

            footerLeft:
                "Security notification",

            footerRight:
                "Verify the source",

            headline:
                "Security activity needs your attention",

            message:
                "A security notification has been issued regarding recent account activity. Review the message carefully before responding.",

            cta:
                "Review Security Activity",

            tactic:
                "Security impersonation"

        },


        financial_alert: {

            header:
                "Financial Services",

            alert:
                "FINANCIAL ALERT",

            alertIcon:
                "fa-solid fa-credit-card",

            icon:
                "fa-solid fa-wallet",

            notice:
                "Financial activity detected",

            status:
                "Review pending",

            footerLeft:
                "Financial notice",

            footerRight:
                "Verify independently",

            headline:
                "Recent financial activity requires review",

            message:
                "A financial activity notice has been associated with your account. Review the details carefully and verify the source before responding.",

            cta:
                "Review Activity",

            tactic:
                "Financial concern and urgency"

        },


        fake_giveaway: {

            header:
                "Promotions",

            alert:
                "SPECIAL REWARD",

            alertIcon:
                "fa-solid fa-gift",

            icon:
                "fa-solid fa-gift",

            notice:
                "Promotional selection",

            status:
                "Selected",

            footerLeft:
                "Promotion notice",

            footerRight:
                "Verify the source",

            headline:
                "Congratulations! You Have Been Selected",

            message:
                "You have been selected for a special promotional opportunity. Review the message carefully and verify the source before responding.",

            cta:
                "View Reward",

            tactic:
                "Attractive reward and social engineering"

        },


        giveaway: {

            header:
                "Promotions",

            alert:
                "SPECIAL REWARD",

            alertIcon:
                "fa-solid fa-gift",

            icon:
                "fa-solid fa-gift",

            notice:
                "Promotional opportunity",

            status:
                "Selection available",

            footerLeft:
                "Promotion notice",

            footerRight:
                "Verify the source",

            headline:
                "You May Have Been Selected",

            message:
                "A promotional opportunity has been associated with your account. Review the details carefully before responding.",

            cta:
                "View Details",

            tactic:
                "Reward-based social engineering"

        },


        prize: {

            header:
                "Promotions",

            alert:
                "PRIZE NOTICE",

            alertIcon:
                "fa-solid fa-award",

            icon:
                "fa-solid fa-gift",

            notice:
                "Prize notification",

            status:
                "Claim available",

            footerLeft:
                "Prize notice",

            footerRight:
                "Verify the source",

            headline:
                "Your Prize Notification Is Ready",

            message:
                "A prize-related notification has been associated with this account. Review the information carefully and verify the source before responding.",

            cta:
                "View Prize Details",

            tactic:
                "Reward and curiosity"

        },


        delivery: {

            header:
                "Delivery Services",

            alert:
                "DELIVERY NOTICE",

            alertIcon:
                "fa-solid fa-truck",

            icon:
                "fa-solid fa-box",

            notice:
                "Shipment update",

            status:
                "Action requested",

            footerLeft:
                "Delivery notice",

            footerRight:
                "Verify the source",

            headline:
                "Your Delivery Requires Attention",

            message:
                "A delivery-related notice requires review. Check the sender and verify the information before following any instructions.",

            cta:
                "Review Delivery",

            tactic:
                "Delivery concern and urgency"

        },


        payment: {

            header:
                "Payment Services",

            alert:
                "PAYMENT NOTICE",

            alertIcon:
                "fa-solid fa-money-bill",

            icon:
                "fa-solid fa-credit-card",

            notice:
                "Payment activity",

            status:
                "Review requested",

            footerLeft:
                "Payment notice",

            footerRight:
                "Verify the source",

            headline:
                "Payment Activity Requires Review",

            message:
                "A payment-related notification requires your attention. Review the information carefully and verify the source before proceeding.",

            cta:
                "Review Payment",

            tactic:
                "Financial concern and urgency"

        },


        verification: {

            header:
                "Account Services",

            alert:
                "VERIFICATION NOTICE",

            alertIcon:
                "fa-solid fa-circle-check",

            icon:
                "fa-solid fa-user-check",

            notice:
                "Identity review",

            status:
                "Verification requested",

            footerLeft:
                "Account notice",

            footerRight:
                "Verify independently",

            headline:
                "Account Verification Requested",

            message:
                "A verification request has been associated with your account. Confirm that the message comes from a legitimate source before responding.",

            cta:
                "Review Verification",

            tactic:
                "Identity impersonation"

        },


        password_reset: {

            header:
                "Account Security",

            alert:
                "PASSWORD NOTICE",

            alertIcon:
                "fa-solid fa-key",

            icon:
                "fa-solid fa-lock",

            notice:
                "Password activity",

            status:
                "Review requested",

            footerLeft:
                "Security notice",

            footerRight:
                "Verify the source",

            headline:
                "Password Activity Requires Attention",

            message:
                "A password-related notification has been associated with your account. Review the notice carefully before responding.",

            cta:
                "Review Password Activity",

            tactic:
                "Security impersonation"

        },


        suspicious_login: {

            header:
                "Login Security",

            alert:
                "LOGIN ALERT",

            alertIcon:
                "fa-solid fa-right-to-bracket",

            icon:
                "fa-solid fa-location-dot",

            notice:
                "Unrecognized login",

            status:
                "Review recommended",

            footerLeft:
                "Login notice",

            footerRight:
                "Verify independently",

            headline:
                "Unrecognized Login Detected",

            message:
                "A login-related notification has been associated with your account. Review the information carefully and verify the source before taking action.",

            cta:
                "Review Login Activity",

            tactic:
                "Account security impersonation"

        }

    };


    return (
        scenarios[scenario] ||
        scenarios.security_alert
    );

}


/* =========================================================
   PLATFORM
   ========================================================= */

function formatPlatform(
    platform
) {

    return formatPlatformName(
        platform
    ).toUpperCase();

}


function formatPlatformName(
    platform
) {

    const platforms = {

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


    const key =
        normalize(platform);


    return (
        platforms[key] ||
        platform ||
        "Social Platform"
    );

}


/* =========================================================
   PLATFORM ICON
   ========================================================= */

function getPlatformIcon(
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
            "fa-brands fa-x-twitter",

        x:
            "fa-brands fa-x-twitter"

    };


    return (
        icons[
            normalize(platform)
        ] ||
        "fa-solid fa-globe"
    );

}


/* =========================================================
   PLATFORM CSS CLASS
   ========================================================= */

function getPlatformClass(
    platform
) {

    const key =
        normalize(platform);


    const classes = {

        facebook:
            "facebook",

        instagram:
            "instagram",

        tiktok:
            "tiktok",

        twitter:
            "twitter",

        x:
            "twitter"

    };


    return (
        classes[key] ||
        "default"
    );

}


/* =========================================================
   SCENARIO CSS CLASS
   ========================================================= */

function getScenarioClass(
    scenario
) {

    const classes = {

        urgency:
            "urgent",

        threat:
            "danger",

        account_warning:
            "danger",

        security_alert:
            "danger",

        financial_alert:
            "financial",

        fake_giveaway:
            "reward",

        giveaway:
            "reward",

        prize:
            "reward",

        delivery:
            "delivery",

        payment:
            "financial",

        verification:
            "urgent",

        password_reset:
            "danger",

        suspicious_login:
            "danger"

    };


    return (
        classes[
            normalize(scenario)
        ] ||
        "urgent"
    );

}


/* =========================================================
   WARNING SIGNS
   ========================================================= */

function parseWarningSigns(
    warningSigns
) {

    if (
        Array.isArray(
            warningSigns
        )
    ) {

        return warningSigns
            .filter(Boolean);

    }


    if (
        typeof warningSigns === "string"
    ) {

        return warningSigns

            .split(/\r?\n/)

            .map(
                item => item.trim()
            )

            .filter(Boolean);

    }


    return [];

}


/* =========================================================
   CTA CLICK
   ========================================================= */

async function handleCampaignClick(
    campaign,
    button
) {

    if (
        !campaign ||
        !button
    ) {
        return;
    }

    if (
        button.dataset.processing === "true"
    ) {
        return;
    }

    button.dataset.processing =
        "true";

    button.disabled =
        true;

    const originalHTML =
        button.innerHTML;

    button.innerHTML = `

        <span>
            Reviewing...
        </span>

        <i
            class="fa-solid fa-spinner fa-spin"
        ></i>

    `;

    try {

        const recorded =
            await recordCampaignEvent(
                campaign
            );

        if (!recorded) {

            console.error(
                "PHISHGUARD: Interaction was not recorded."
            );

            button.innerHTML =
                originalHTML;

            button.disabled =
                false;

            button.dataset.processing =
                "false";

            return;
        }

        showAwareness(
            campaign
        );

    } catch (error) {

        console.error(
            "PHISHGUARD: Campaign interaction failed:",
            error
        );

        button.innerHTML =
            originalHTML;

        button.disabled =
            false;

        button.dataset.processing =
            "false";
    }
}


/* =========================================================
   RECORD CLICK
   ========================================================= */

async function recordCampaignEvent(
    campaign
) {

    if (
        !campaign ||
        !campaign.id
    ) {
        console.error(
            "PHISHGUARD: Missing campaign ID."
        );

        return false;
    }

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        console.error(
            "PHISHGUARD: Supabase client unavailable."
        );

        return false;
    }

    try {

        const {
            error
        } = await supabaseClient

            .from("click_events")

            .insert({

                campaign_id:
                    campaign.id,

                participant_id:
                    null,

                platform:
                    campaign.platform,

                scenario_type:
                    campaign.scenario_type,

                clicked_at:
                    new Date().toISOString(),

                awareness_shown:
                    true

            });

        if (error) {

            console.error(
                "PHISHGUARD: Unable to record interaction:",
                error
            );

            return false;
        }

        console.log(
            "PHISHGUARD: Interaction recorded successfully.",
            campaign.id
        );

        return true;

    } catch (error) {

        console.error(
            "PHISHGUARD: Interaction recording error:",
            error
        );

        return false;
    }
}


/* =========================================================
   AWARENESS RESULT
   ========================================================= */

function showAwareness(
    campaign
) {

    if (!phishingCard) {

        return;
    }


    const warnings =
        parseWarningSigns(
            campaign.warning_signs
        );


    const fallbackWarnings = [

        "Unexpected request for immediate action.",

        "Message uses urgency, reward, fear, or concern.",

        "Sender or source should be independently verified."

    ];


    const finalWarnings =
        warnings.length > 0
            ? warnings
            : fallbackWarnings;


    const warningItems =
        finalWarnings

            .map(
                warning => `

                    <li>

                        <i
                            class="
                                fa-solid
                                fa-circle-exclamation
                            "
                        ></i>

                        <span>
                            ${escapeHTML(warning)}
                        </span>

                    </li>

                `
            )

            .join("");


    const scenario =
        formatScenario(
            campaign.scenario_type
        );


    const tactic =
        campaign.tactic ||
        scenario;


    phishingCard.innerHTML = `

        <div class="awareness-result">

            <div class="awareness-icon">

                <i
                    class="
                        fa-solid
                        fa-shield-halved
                    "
                ></i>

            </div>


            <div class="awareness-badge">

                CYBERSECURITY AWARENESS

            </div>


            <h1>

                You encountered a
                suspicious message.

            </h1>


            <p class="awareness-intro">

                The message you just reviewed
                demonstrates how social-engineering
                techniques can make an unexpected
                request appear trustworthy.

            </p>


            <div class="awareness-tactic">

                <span>
                    SCENARIO
                </span>

                <strong>
                    ${escapeHTML(scenario)}
                </strong>

            </div>


            <div class="awareness-tactic">

                <span>
                    TACTIC
                </span>

                <strong>
                    ${escapeHTML(tactic)}
                </strong>

            </div>


            <div class="awareness-warning-box">

                <div class="warning-heading">

                    <i
                        class="
                            fa-solid
                            fa-circle-exclamation
                        "
                    ></i>

                    <span>
                        Warning signs to notice
                    </span>

                </div>


                <ul>

                    ${warningItems}

                </ul>

            </div>


            <div class="awareness-tips">

                <div class="tips-heading">

                    <i
                        class="
                            fa-solid
                            fa-lightbulb
                        "
                    ></i>

                    <span>
                        Safer response
                    </span>

                </div>


                <div class="tip">

                    <i
                        class="
                            fa-solid
                            fa-check
                        "
                    ></i>

                    <span>
                        Pause before responding
                        to unexpected messages.
                    </span>

                </div>


                <div class="tip">

                    <i
                        class="
                            fa-solid
                            fa-check
                        "
                    ></i>

                    <span>
                        Verify the sender through
                        an independent official channel.
                    </span>

                </div>


                <div class="tip">

                    <i
                        class="
                            fa-solid
                            fa-check
                        "
                    ></i>

                    <span>
                        Do not provide credentials,
                        payment details, or sensitive
                        information from an unexpected request.
                    </span>

                </div>

            </div>


            <button
                id="returnButton"
                class="awareness-return"
                type="button"
            >

                <i
                    class="
                        fa-solid
                        fa-arrow-left
                    "
                ></i>

                Return to Message

            </button>

        </div>

    `;


    const returnButton =
        document.getElementById(
            "returnButton"
        );


    if (returnButton) {

        returnButton.addEventListener(
            "click",
            () => {

                renderCampaign(
                    campaign
                );

            }
        );

    }

}


/* =========================================================
   SCENARIO FORMAT
   ========================================================= */

function formatScenario(
    scenario
) {

    const scenarios = {

        urgency:
            "Urgency",

        threat:
            "Threat / Fear",

        account_warning:
            "Account Warning",

        security_alert:
            "Security Alert",

        financial_alert:
            "Financial Alert",

        fake_giveaway:
            "Fake Giveaway",

        giveaway:
            "Fake Giveaway",

        prize:
            "Fake Prize",

        delivery:
            "Delivery Alert",

        payment:
            "Payment Alert",

        verification:
            "Account Verification",

        password_reset:
            "Password Reset",

        suspicious_login:
            "Suspicious Login"

    };


    const key =
        normalize(scenario);


    return (
        scenarios[key] ||
        scenario ||
        "Security Alert"
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (loadingState) {

        loadingState.classList.remove(
            "hidden"
        );

    }


    if (simulationContainer) {

        simulationContainer.classList.add(
            "hidden"
        );

    }


    if (errorState) {

        errorState.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError() {

    if (loadingState) {

        loadingState.classList.add(
            "hidden"
        );

    }


    if (simulationContainer) {

        simulationContainer.classList.add(
            "hidden"
        );

    }


    if (errorState) {

        errorState.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalize(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

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