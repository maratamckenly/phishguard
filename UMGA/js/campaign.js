// ============================================================
// PHISHGUARD - CAMPAIGN MANAGEMENT
// FULL REPLACEMENT
// Automatic Campaign Generator
// ============================================================

(() => {

    "use strict";


    // ============================================================
    // SUPABASE
    // ============================================================

    const supabaseClient =
        window.phishguardSupabase ||
        window.supabaseClient ||
        window.supabase;


    // ============================================================
    // DOM HELPER
    // ============================================================

    function getElement(id) {
        return document.getElementById(id);
    }


    // ============================================================
    // INITIALIZATION
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        initializeCampaignPage
    );


    async function initializeCampaignPage() {

        console.log(
            "PHISHGUARD CAMPAIGNS: initializing..."
        );


        // --------------------------------------------------------
        // CHECK SUPABASE
        // --------------------------------------------------------

        if (
            !supabaseClient ||
            typeof supabaseClient.auth?.getSession !== "function"
        ) {

            console.error(
                "PHISHGUARD: Supabase client unavailable."
            );

            return;
        }


        // --------------------------------------------------------
        // AUTH CHECK
        // --------------------------------------------------------

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {

            console.error(
                "PHISHGUARD: Session error:",
                sessionError
            );

            window.location.href = "index.html";

            return;
        }


        const session =
            sessionData?.session;


        if (!session) {

            console.warn(
                "PHISHGUARD: No authenticated session."
            );

            window.location.href = "index.html";

            return;
        }


        // --------------------------------------------------------
        // PROFILE
        // --------------------------------------------------------

        loadProfile(session);


        // --------------------------------------------------------
        // LOAD EXISTING CAMPAIGNS
        // --------------------------------------------------------

        await loadCampaigns();


        // --------------------------------------------------------
        // CAMPAIGN FORM
        // --------------------------------------------------------

        const campaignForm =
            getElement("campaignForm");


        if (campaignForm) {

            campaignForm.addEventListener(
                "submit",
                createCampaign
            );

        }


        // --------------------------------------------------------
        // AUTOMATIC GENERATOR
        // --------------------------------------------------------

        const generateButton =
            getElement("generateButton");


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                generateCampaignContent
            );

        }


        // --------------------------------------------------------
        // NEW CAMPAIGN BUTTON
        // --------------------------------------------------------

        const newCampaignButton =
            getElement("newCampaignButton");


        if (newCampaignButton) {

            newCampaignButton.addEventListener(
                "click",
                () => {

                    const builder =
                        getElement("campaignBuilder");


                    if (builder) {

                        builder.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }


                    setTimeout(() => {

                        getElement(
                            "campaignName"
                        )?.focus();

                    }, 400);

                }
            );

        }


        // --------------------------------------------------------
        // LOGOUT
        // --------------------------------------------------------

        setupLogout();


        // --------------------------------------------------------
        // COPY GENERATED LINK
        // --------------------------------------------------------

        setupCopyButton();


        // --------------------------------------------------------
        // OPEN GENERATED SIMULATION
        // --------------------------------------------------------

        setupOpenSimulation();


        console.log(
            "PHISHGUARD CAMPAIGNS: ready."
        );

    }


    // ============================================================
    // PROFILE
    // ============================================================

    function loadProfile(session) {

        const profileName =
            getElement("profileName");

        const profileAvatar =
            getElement("profileAvatar");


        const displayName =
            session?.user?.user_metadata?.full_name ||
            session?.user?.user_metadata?.name ||
            session?.user?.email?.split("@")[0] ||
            "Admin";


        if (profileName) {

            profileName.textContent =
                displayName;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                displayName
                    .charAt(0)
                    .toUpperCase();

        }

    }


    // ============================================================
    // AUTOMATIC CAMPAIGN GENERATOR
    // ============================================================

    async function generateCampaignContent() {

        const button =
            getElement("generateButton");

        const buttonText =
            getElement("generateText");

        const loader =
            getElement("generateLoader");


        const platform =
            getElement("platform")?.value ||
            "facebook";


        const scenario =
            getElement("scenarioType")?.value ||
            "threat_account_warning";


        const tone =
            getElement("generatorTone")?.value ||
            "professional";


        const campaignName =
            getElement("campaignName")?.value?.trim() ||
            "";


        // --------------------------------------------------------
        // PREVENT DOUBLE CLICK
        // --------------------------------------------------------

        if (
            button &&
            button.disabled
        ) {

            return;
        }


        // --------------------------------------------------------
        // LOADING STATE
        // --------------------------------------------------------

        setGeneratorLoading(
            true,
            button,
            buttonText,
            loader
        );


        try {

            await delay(450);


            const generated =
                buildCampaignTemplate(
                    platform,
                    scenario,
                    tone,
                    campaignName
                );


            // ----------------------------------------------------
            // WRITE GENERATED CONTENT
            // ----------------------------------------------------

            setValue(
                "headline",
                generated.headline
            );


            setValue(
                "message",
                generated.message
            );


            setValue(
                "cta",
                generated.cta
            );


            setValue(
                "tactic",
                generated.tactic
            );


            setValue(
                "warningSigns",
                generated.warningSigns
            );


            // ----------------------------------------------------
            // SHOW GENERATED SECTION
            // ----------------------------------------------------

            const generatedContent =
                getElement("generatedContent");


            if (generatedContent) {

                generatedContent.classList.add(
                    "generated-active"
                );

            }


            console.log(
                "PHISHGUARD: Campaign content generated.",
                generated
            );


        } catch (error) {

            console.error(
                "PHISHGUARD: Generator error:",
                error
            );

            alert(
                "Generator Error:\n\n" +
                (error?.message || String(error))
            );


        } finally {

            setGeneratorLoading(
                false,
                button,
                buttonText,
                loader
            );

        }

    }


    // ============================================================
    // GENERATOR LOADING STATE
    // ============================================================

    function setGeneratorLoading(
        loading,
        button,
        buttonText,
        loader
    ) {

        if (button) {

            button.disabled =
                loading;

            button.classList.toggle(
                "loading",
                loading
            );

        }


        if (buttonText) {

            buttonText.hidden =
                loading;

            buttonText.style.display =
                loading
                    ? "none"
                    : "";

        }


        if (loader) {

            loader.hidden =
                !loading;

            loader.classList.toggle(
                "hidden",
                !loading
            );

            loader.style.display =
                loading
                    ? "inline-flex"
                    : "none";

        }


        // --------------------------------------------------------
        // SUPPORT HTML WHERE THE TEXT IS INSIDE THE BUTTON
        // --------------------------------------------------------

        if (button && !buttonText) {

            if (loading) {

                if (!button.dataset.originalText) {

                    button.dataset.originalText =
                        button.textContent.trim();

                }

                button.textContent =
                    "Generating...";

            } else {

                if (button.dataset.originalText) {

                    button.textContent =
                        button.dataset.originalText;

                }

            }

        }

    }


    // ============================================================
    // CAMPAIGN TEMPLATE ENGINE
    // ============================================================

    function buildCampaignTemplate(
        platform,
        scenario,
        tone,
        campaignName
    ) {

        const platformName =
            formatPlatform(platform);


        // ========================================================
        // THREAT / ACCOUNT WARNING
        // ========================================================

        if (
            scenario ===
            "threat_account_warning"
        ) {

            if (tone === "urgent") {

                return {

                    headline:
                        `${platformName} Account Security Alert`,

                    message:
                        `We detected unusual activity associated with your ${platformName} account. This controlled security-awareness simulation demonstrates how urgent account warnings can create pressure to act quickly. Review the notification carefully before responding.`,

                    cta:
                        "Review Account",

                    tactic:
                        "Urgency and fear of account loss",

                    warningSigns:
                        "Unexpected security warning\nUrgent language encouraging immediate action\nMessage creates fear of account suspension\nUnverified security request\nPressure to act before checking the source"

                };

            }


            if (tone === "security") {

                return {

                    headline:
                        `Important ${platformName} Security Notification`,

                    message:
                        `A security notification has been issued regarding your ${platformName} account. This awareness simulation demonstrates how attackers may imitate legitimate security messages. Verify the source before taking action.`,

                    cta:
                        "Review Security Alert",

                    tactic:
                        "Impersonation of a security notification",

                    warningSigns:
                        "Security-related impersonation\nUnexpected account notification\nGeneric security language\nNo verified sender information\nRequest requires additional verification"

                };

            }


            return {

                headline:
                    `${platformName} Account Security Notification`,

                message:
                    `We noticed activity that may require your attention. This controlled awareness simulation demonstrates how convincing security notifications can encourage users to react without first verifying the message or sender.`,

                cta:
                    "Review Notification",

                tactic:
                    "Security impersonation and urgency",

                warningSigns:
                    "Unexpected security notification\nUrgent or concerning wording\nSender identity is unclear\nMessage encourages immediate action\nSource should be independently verified"

            };

        }


        // ========================================================
        // FINANCIAL ALERT
        // ========================================================

        if (
            scenario ===
            "financial_alert"
        ) {

            return {

                headline:
                    `${platformName} Payment Security Alert`,

                message:
                    `A recent account or payment notification requires your attention. This controlled cybersecurity-awareness simulation demonstrates how financial alerts can be used to create urgency and encourage users to act before verifying the request.`,

                cta:
                    "Review Alert",

                tactic:
                    "Financial urgency and authority impersonation",

                warningSigns:
                    "Unexpected payment notification\nFinancial information is mentioned\nUrgent action is encouraged\nSender or source is not independently verified\nMessage attempts to create anxiety"

            };

        }


        // ========================================================
        // FAKE GIVEAWAY
        // ========================================================

        if (
            scenario ===
            "fake_giveaway"
        ) {

            return {

                headline:
                    "Congratulations! You Have Been Selected",

                message:
                    `You have been selected for a special ${platformName} promotional opportunity. This controlled awareness simulation demonstrates how attractive rewards can be used to make suspicious messages appear trustworthy.`,

                cta:
                    "View Reward",

                tactic:
                    "Prize bait and curiosity",

                warningSigns:
                    "Unexpected prize or reward\nOffer appears unusually attractive\nNo participation history\nSender or promotion is difficult to verify\nRequest encourages immediate interaction"

            };

        }


        // ========================================================
        // PASSWORD RESET
        // ========================================================

        if (
            scenario ===
            "password_reset"
        ) {

            return {

                headline:
                    `${platformName} Password Reset Request`,

                message:
                    `A password-related security request has been detected for your ${platformName} account. This controlled simulation demonstrates how password-reset messages can encourage users to respond without verifying the source first.`,

                cta:
                    "Review Password Request",

                tactic:
                    "Credential-related impersonation",

                warningSigns:
                    "Unexpected password-reset message\nSecurity request was not initiated by the user\nSender identity should be verified\nUrgency may discourage careful checking\nNever provide credentials through suspicious links"

            };

        }


        // ========================================================
        // SECURITY VERIFICATION
        // ========================================================

        if (
            scenario ===
            "security_verification"
        ) {

            return {

                headline:
                    `${platformName} Security Verification Required`,

                message:
                    `Your account has been selected for a security verification check. This controlled awareness simulation demonstrates how verification requests may be used to create trust and encourage users to disclose information or follow unexpected instructions.`,

                cta:
                    "Begin Review",

                tactic:
                    "Authority and verification impersonation",

                warningSigns:
                    "Unexpected verification request\nMessage uses official-sounding language\nSender should be independently confirmed\nRequest appears time-sensitive\nSensitive information should never be submitted without verification"

            };

        }


        // ========================================================
        // FALLBACK
        // ========================================================

        return {

            headline:
                `${platformName} Security Notification`,

            message:
                `This controlled cybersecurity-awareness simulation demonstrates how suspicious notifications may attempt to persuade users to act quickly. Always verify unexpected requests before interacting with them.`,

            cta:
                "Review Notification",

            tactic:
                "Social engineering",

            warningSigns:
                "Unexpected message\nUrgent wording\nUnknown sender\nSuspicious request\nVerify before responding"

        };

    }


    // ============================================================
    // CREATE CAMPAIGN
    // ============================================================

    async function createCampaign(event) {

        event.preventDefault();


        if (!supabaseClient) {

            alert(
                "Supabase is not available."
            );

            return;
        }


        // --------------------------------------------------------
        // SESSION
        // --------------------------------------------------------

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (
            sessionError ||
            !sessionData?.session
        ) {

            window.location.href =
                "index.html";

            return;
        }


        const session =
            sessionData.session;


        // --------------------------------------------------------
        // FORM VALUES
        // --------------------------------------------------------

        const campaignName =
            getElement("campaignName")
                ?.value
                ?.trim();


        const platform =
            getElement("platform")
                ?.value;


        const scenarioType =
            getElement("scenarioType")
                ?.value ||
            "threat_account_warning";


        const headline =
            getElement("headline")
                ?.value
                ?.trim();


        const message =
            getElement("message")
                ?.value
                ?.trim();


        const cta =
            getElement("cta")
                ?.value
                ?.trim();


        const tactic =
            getElement("tactic")
                ?.value
                ?.trim();


        const warningSigns =
            getElement("warningSigns")
                ?.value
                ?.trim();


        const active =
            getElement("campaignActive")
                ?.checked !== false;


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!campaignName) {

            alert(
                "Please enter a campaign name."
            );

            getElement(
                "campaignName"
            )?.focus();

            return;
        }


        if (!platform) {

            alert(
                "Please select a platform."
            );

            return;
        }


        if (!headline) {

            alert(
                "Please generate or enter a headline."
            );

            return;
        }


        if (!message) {

            alert(
                "Please generate or enter a message."
            );

            return;
        }


        if (!cta) {

            alert(
                "Please generate or enter a CTA."
            );

            return;
        }


        // --------------------------------------------------------
        // CREATE BUTTON STATE
        // --------------------------------------------------------

        const button =
            getElement("createButton");

        const createText =
            getElement("createText");

        const createLoader =
            getElement("createLoader");


        setCreateLoading(
            true,
            button,
            createText,
            createLoader
        );


        let campaign = null;


        try {

            // ====================================================
            // CREATE CAMPAIGN
            // ====================================================

            const {
                data,
                error
            } = await supabaseClient
                .from("campaigns")
                .insert({

                    campaign_name:
                        campaignName,

                    platform:
                        platform,

                    scenario_type:
                        scenarioType,

                    headline:
                        headline,

                    message:
                        message,

                    cta:
                        cta,

                    tactic:
                        tactic,

                    warning_signs:
                        warningSigns,

                    active:
                        active

                })
                .select()
                .single();


            if (error) {

                console.error(
                    "PHISHGUARD: Campaign insert error:",
                    error
                );

                throw error;
            }


            campaign =
                data;


            // ====================================================
            // GENERATE SHORT CODE
            // ====================================================

            const shortCode =
                generateShortCode();


            console.log(
                "PHISHGUARD: Generated campaign code:",
                shortCode
            );


            // ====================================================
            // CREATE TRACKING LINK
            // ====================================================

            const {
                data: linkData,
                error: linkError
            } = await supabaseClient
                .from("tracking_links")
                .insert({

                    campaign_id:
                        campaign.id,

                    platform:
                        platform,

                    short_code:
                        shortCode

                })
                .select()
                .single();


            if (linkError) {

                console.error(
                    "PHISHGUARD: Tracking link error:",
                    linkError
                );

                throw linkError;
            }


            // ====================================================
            // BUILD REAL SIMULATION URL
            // ====================================================

            const simulationUrl =
                buildSimulationUrl(
                    linkData.short_code
                );


            console.log(
                "PHISHGUARD: Simulation URL:",
                simulationUrl
            );


            // ====================================================
            // SHOW GENERATED LINK
            // ====================================================

            setText(
                "generatedLink",
                simulationUrl
            );


            setText(
                "generatedPlatform",
                formatPlatform(platform)
            );


            const linkResult =
                getElement("linkResult");


            if (linkResult) {

                linkResult.hidden =
                    false;

                linkResult.style.display =
                    "";

                linkResult.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


            window.phishguardGeneratedLink =
                simulationUrl;


            // ====================================================
            // RESET FORM
            // ====================================================

            const form =
                getElement("campaignForm");


            if (form) {

                form.reset();

            }


            // ====================================================
            // RESTORE ACTIVE CHECKBOX
            // ====================================================

            const activeCheckbox =
                getElement("campaignActive");


            if (activeCheckbox) {

                activeCheckbox.checked =
                    true;

            }


            // ====================================================
            // RESET GENERATED SECTION
            // ====================================================

            const generatedContent =
                getElement("generatedContent");


            if (generatedContent) {

                generatedContent.classList.remove(
                    "generated-active"
                );

            }


            // ====================================================
            // REFRESH CAMPAIGN LIST
            // ====================================================

            await loadCampaigns();


            console.log(
                "PHISHGUARD: Campaign created successfully.",
                campaign
            );


        } catch (error) {

            console.error(
                "PHISHGUARD: Campaign creation failed:",
                error
            );


            if (
                campaign &&
                error
            ) {

                alert(
                    "Campaign was created, but the simulation link could not be created.\n\n" +
                    (
                        error?.message ||
                        "Please check your tracking_links table."
                    )
                );

            } else {

                alert(
                    error?.message ||
                    "Unable to create campaign."
                );

            }


            // Refresh list because the campaign may
            // have been inserted before the error.

            await loadCampaigns();


        } finally {

            setCreateLoading(
                false,
                button,
                createText,
                createLoader
            );

        }

    }


    // ============================================================
    // CREATE BUTTON LOADING STATE
    // ============================================================

    function setCreateLoading(
        loading,
        button,
        text,
        loader
    ) {

        if (button) {

            button.disabled =
                loading;

            button.classList.toggle(
                "loading",
                loading
            );

        }


        if (text) {

            text.hidden =
                loading;

            text.style.display =
                loading
                    ? "none"
                    : "";

        }


        if (loader) {

            loader.hidden =
                !loading;

            loader.classList.toggle(
                "hidden",
                !loading
            );

            loader.style.display =
                loading
                    ? "inline-flex"
                    : "none";

        }

    }


    // ============================================================
    // LOAD CAMPAIGNS
    // ============================================================

    async function loadCampaigns() {

        const list =
            getElement("campaignList");

        const total =
            getElement("campaignTotal");


        try {

            // ----------------------------------------------------
            // LOAD CAMPAIGNS
            // ----------------------------------------------------

            const {
                data: campaigns,
                error: campaignError
            } = await supabaseClient
                .from("campaigns")
                .select(`
                    id,
                    campaign_name,
                    platform,
                    scenario_type,
                    headline,
                    active,
                    created_at
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (campaignError) {

                throw campaignError;

            }


            // ----------------------------------------------------
            // LOAD TRACKING LINKS
            // ----------------------------------------------------

            const {
                data: trackingLinks,
                error: trackingError
            } = await supabaseClient
                .from("tracking_links")
                .select(`
                    id,
                    campaign_id,
                    platform,
                    short_code
                `);


            if (trackingError) {

                console.warn(
                    "PHISHGUARD: Tracking links unavailable:",
                    trackingError
                );

            }


            const campaignsData =
                campaigns || [];


            const linksData =
                trackingLinks || [];


            // ----------------------------------------------------
            // TOTAL
            // ----------------------------------------------------

            if (total) {

                total.textContent =
                    `${campaignsData.length} CAMPAIGNS`;

            }


            // ----------------------------------------------------
            // EMPTY
            // ----------------------------------------------------

            if (!list) {

                return;

            }


            if (!campaignsData.length) {

                list.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            <i class="fa-solid fa-bullhorn"></i>
                        </div>

                        <strong>
                            No campaigns yet
                        </strong>

                        <span>
                            Create your first simulation above.
                        </span>

                    </div>

                `;

                return;
            }


            // ----------------------------------------------------
            // RENDER CAMPAIGNS
            // ----------------------------------------------------

            list.innerHTML =
                campaignsData
                    .map(
                        campaign =>
                            renderCampaignRow(
                                campaign,
                                linksData
                            )
                    )
                    .join("");


            // ----------------------------------------------------
            // COPY BUTTONS
            // ----------------------------------------------------

            setupRowCopyButtons();


            // ----------------------------------------------------
            // DETAILS BUTTONS
            // ----------------------------------------------------

            setupRowDetailsButtons();


            // ----------------------------------------------------
            // OPEN BUTTONS
            // ----------------------------------------------------

            setupRowOpenButtons();


        } catch (error) {

            console.error(
                "PHISHGUARD: Unable to load campaigns:",
                error
            );


            if (list) {

                list.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon error">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>

                        <strong>
                            Unable to load campaigns
                        </strong>

                        <span>
                            ${escapeHtml(
                                error?.message ||
                                "Database error."
                            )}
                        </span>

                    </div>

                `;

            }

        }

    }


    // ============================================================
    // RENDER CAMPAIGN
    // ============================================================

    function renderCampaignRow(
        campaign,
        linksData
    ) {

        const link =
            linksData.find(
                item =>
                    String(item.campaign_id) ===
                    String(campaign.id)
            );


        const simulationUrl =
            link
                ? buildSimulationUrl(
                    link.short_code
                )
                : "";


        const status =
            campaign.active
                ? "ACTIVE"
                : "INACTIVE";


        const statusClass =
            campaign.active
                ? "status-active"
                : "status-inactive";


        const platform =
            formatPlatform(
                campaign.platform
            );


        const scenario =
            formatScenario(
                campaign.scenario_type
            );


        const createdDate =
            formatDate(
                campaign.created_at
            );


        return `

            <article
                class="campaign-row"
                data-campaign-id="${escapeHtml(
                    campaign.id
                )}"
            >

                <div class="campaign-main">

                    <div class="campaign-icon">

                        <i class="${getPlatformIcon(
                            campaign.platform
                        )}"></i>

                    </div>


                    <div class="campaign-info">

                        <strong class="campaign-title">

                            ${escapeHtml(
                                campaign.campaign_name ||
                                "Untitled Campaign"
                            )}

                        </strong>


                        <div class="campaign-meta">

                            <span>
                                ${escapeHtml(platform)}
                            </span>

                            <span class="meta-separator">
                                •
                            </span>

                            <span>
                                ${escapeHtml(scenario)}
                            </span>

                        </div>

                    </div>

                </div>


                <div class="campaign-date">

                    ${escapeHtml(createdDate)}

                </div>


                <div class="campaign-status">

                    <span class="${statusClass}">

                        <span class="status-dot"></span>

                        ${status}

                    </span>

                </div>


                <div class="campaign-actions">

                    <button
                        type="button"
                        class="row-action-button row-details-button"
                        data-campaign-id="${escapeHtml(campaign.id)}"
                        title="View campaign details"
                    >
                        <i class="fa-solid fa-circle-info"></i>
                        Details
                    </button>

                    ${
                        simulationUrl

                            ? `

                                <button
                                    type="button"
                                    class="row-action-button row-open-button"
                                    data-link="${escapeHtml(
                                        simulationUrl
                                    )}"
                                    title="Open simulation"
                                >
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    Open
                                </button>


                                <button
                                    type="button"
                                    class="row-action-button row-copy-button"
                                    data-link="${escapeHtml(
                                        simulationUrl
                                    )}"
                                    title="Copy simulation link"
                                >
                                    <i class="fa-regular fa-copy"></i>
                                    Copy
                                </button>

                            `

                            : `

                                <span class="no-link">
                                    No link
                                </span>

                            `
                    }

                </div>

            </article>

        `;

    }


    // ============================================================
    // ROW COPY BUTTONS
    // ============================================================

    function setupRowCopyButtons() {

        const buttons =
            document.querySelectorAll(
                ".row-copy-button"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const link =
                            button.dataset.link;


                        if (!link) {

                            return;

                        }


                        const success =
                            await copyToClipboard(
                                link
                            );


                        if (success) {

                            const original =
                                button.innerHTML;


                            button.innerHTML =
                                `<i class="fa-solid fa-check"></i> Copied`;


                            button.classList.add(
                                "copied"
                            );


                            setTimeout(
                                () => {

                                    button.innerHTML =
                                        original;

                                    button.classList.remove(
                                        "copied"
                                    );

                                },
                                1500
                            );

                        }

                    }
                );

            }
        );

    }


    // ============================================================
    // ROW DETAILS BUTTONS
    // ============================================================

    function setupRowDetailsButtons() {

        const buttons =
            document.querySelectorAll(
                ".row-details-button"
            );

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const campaignId =
                        button.dataset.campaignId;

                    if (!campaignId) {
                        return;
                    }

                    window.location.href =
                        "campaign-details.html?campaign=" +
                        encodeURIComponent(campaignId);

                }
            );

        });

    }


    // ============================================================
    // ROW OPEN BUTTONS
    // ============================================================

    function setupRowOpenButtons() {

        const buttons =
            document.querySelectorAll(
                ".row-open-button"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const link =
                            button.dataset.link;


                        if (!link) {

                            return;

                        }


                        window.open(
                            link,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }
                );

            }
        );

    }


    // ============================================================
    // COPY GENERATED LINK
    // ============================================================

    function setupCopyButton() {

        const copyButton =
            getElement(
                "copyLinkButton"
            );


        if (!copyButton) {

            return;

        }


        copyButton.addEventListener(
            "click",
            async () => {

                const link =
                    getElement(
                        "generatedLink"
                    )?.textContent
                    ?.trim();


                if (
                    !link ||
                    link === "—"
                ) {

                    return;

                }


                const success =
                    await copyToClipboard(
                        link
                    );


                if (success) {

                    const original =
                        copyButton.innerHTML;


                    copyButton.innerHTML =
                        `<i class="fa-solid fa-check"></i> Copied`;


                    setTimeout(
                        () => {

                            copyButton.innerHTML =
                                original;

                        },
                        1500
                    );

                }

            }
        );

    }


    // ============================================================
    // OPEN GENERATED SIMULATION
    // ============================================================

    function setupOpenSimulation() {

        const button =
            getElement(
                "openGeneratedLink"
            );


        if (!button) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                const link =
                    getElement(
                        "generatedLink"
                    )?.textContent
                    ?.trim();


                if (
                    !link ||
                    link === "—"
                ) {

                    return;

                }


                window.open(
                    link,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    // ============================================================
    // LOGOUT
    // ============================================================

    function setupLogout() {

        const logoutButton =
            getElement(
                "logoutButton"
            );


        if (!logoutButton) {

            return;

        }


        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled =
                    true;


                try {

                    await supabaseClient
                        .auth
                        .signOut();


                } catch (error) {

                    console.error(
                        "PHISHGUARD: Logout error:",
                        error
                    );

                }


                window.location.href =
                    "index.html";

            }
        );

    }


    // ============================================================
    // COPY TO CLIPBOARD
    // ============================================================

    async function copyToClipboard(text) {

        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator
                    .clipboard
                    .writeText(text);

                return true;

            }

        } catch (error) {

            console.warn(
                "PHISHGUARD: Clipboard API failed.",
                error
            );

        }


        // --------------------------------------------------------
        // FALLBACK
        // --------------------------------------------------------

        try {

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value =
                text;


            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-9999px";

            textarea.style.top =
                "0";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();


            const successful =
                document.execCommand(
                    "copy"
                );


            textarea.remove();


            return successful;


        } catch (error) {

            console.error(
                "PHISHGUARD: Clipboard fallback failed:",
                error
            );


            return false;

        }

    }


    // ============================================================
    // BUILD SIMULATION URL
    // ============================================================

    function buildSimulationUrl(shortCode) {
        const currentPath = window.location.pathname;
        const baseDirectory =
            currentPath.substring(0, currentPath.lastIndexOf("/") + 1);

        return (
            window.location.origin +
            baseDirectory +
            "scholarship/" +
            encodeURIComponent(shortCode)
        );
    }


    // ============================================================
    // GENERATE SHORT CODE
    // ============================================================

    function generateShortCode() {

        const characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


        let result = "";


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            result +=
                characters.charAt(
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                );

        }


        return result;

    }


    // ============================================================
    // FORMAT PLATFORM
    // ============================================================

    function formatPlatform(
        platform
    ) {

        const value =
            String(
                platform || ""
            )
            .toLowerCase();


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


        return (
            platforms[value] ||
            capitalize(value) ||
            "Social Platform"
        );

    }


    // ============================================================
    // PLATFORM ICON
    // ============================================================

    function getPlatformIcon(
        platform
    ) {

        const value =
            String(
                platform || ""
            )
            .toLowerCase();


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
            icons[value] ||
            "fa-solid fa-shield-halved"
        );

    }


    // ============================================================
    // FORMAT SCENARIO
    // ============================================================

    function formatScenario(
        scenario
    ) {

        const scenarios = {

            threat_account_warning:
                "Threat / Account Warning",

            financial_alert:
                "Financial Alert",

            fake_giveaway:
                "Fake Giveaway",

            password_reset:
                "Password Reset",

            security_verification:
                "Security Verification"

        };


        return (
            scenarios[scenario] ||
            "Security Awareness"
        );

    }


    // ============================================================
    // FORMAT DATE
    // ============================================================

    function formatDate(
        value
    ) {

        if (!value) {

            return "—";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "2-digit",
                year: "numeric"
            }
        );

    }


    // ============================================================
    // CAPITALIZE
    // ============================================================

    function capitalize(
        value
    ) {

        if (!value) {

            return "";

        }


        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );

    }


    // ============================================================
    // SET TEXT
    // ============================================================

    function setText(
        id,
        value
    ) {

        const element =
            getElement(id);


        if (element) {

            element.textContent =
                value ?? "";

        }

    }


    // ============================================================
    // SET INPUT VALUE
    // ============================================================

    function setValue(
        id,
        value
    ) {

        const element =
            getElement(id);


        if (element) {

            element.value =
                value ?? "";

        }

    }


    // ============================================================
    // DELAY
    // ============================================================

    function delay(
        milliseconds
    ) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );

    }


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

    }


})();
