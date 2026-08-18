const express = require('express');
const app = express();

app.use(express.json());

app.post('/release-gate', (req, res) => {
    try {
        const { target, event, ref, workflow, image } = req.body;
        const violations = [];

        // EXCESS_PERMISSION
        const p = workflow?.permissions || {};
        const keys = Object.keys(p);
        const expectedKeys = ['contents', 'packages', 'id-token'];
        const exactKeys = keys.length === 3 && expectedKeys.every(k => keys.includes(k));
        if (!exactKeys || p.contents !== 'read' || p.packages !== 'write' || p['id-token'] !== 'none') {
            violations.push('EXCESS_PERMISSION');
        }

        // UNSAFE_PR_TRIGGER
        if (event === 'pull_request') {
            if (workflow?.trigger !== 'pull_request') {
                violations.push('UNSAFE_PR_TRIGGER');
            }
        }
        if (workflow?.trigger === 'pull_request_target') {
            if (!violations.includes('UNSAFE_PR_TRIGGER')) {
                violations.push('UNSAFE_PR_TRIGGER');
            }
        }

        // TESTS_INCOMPLETE
        if (workflow?.testsPassed !== true || workflow?.matrixComplete !== true || workflow?.failFast !== false) {
            violations.push('TESTS_INCOMPLETE');
        }

        // MUTABLE_ACTION
        if (Array.isArray(workflow?.actions)) {
            for (const action of workflow.actions) {
                if (action.owner !== 'actions') {
                    if (!/^[a-f0-9]{40}$/.test(action.ref)) {
                        violations.push('MUTABLE_ACTION');
                        break;
                    }
                }
            }
        } else if (workflow?.actions) {
             // In case it is passed as something else
        }

        // SINGLE_STAGE_IMAGE
        if (image?.multiStage !== true) {
            violations.push('SINGLE_STAGE_IMAGE');
        }

        // ROOT_RUNTIME
        if (image?.runsAsRoot !== false) {
            violations.push('ROOT_RUNTIME');
        }

        // SECRET_IN_LAYER
        if (image?.secretMode !== 'none' && image?.secretMode !== 'buildkit') {
            violations.push('SECRET_IN_LAYER');
        }

        // CRITICAL_CVE
        if (image?.criticalVulnerabilities !== 0) {
            violations.push('CRITICAL_CVE');
        }

        // UNPINNED_IMAGE
        if (image?.digestPinned !== true) {
            violations.push('UNPINNED_IMAGE');
        }

        // INVALID_PRODUCTION_REF
        if (target === 'production') {
            if (event !== 'push' || ref !== 'refs/heads/main') {
                violations.push('INVALID_PRODUCTION_REF');
            }
            if (workflow?.environmentApproval !== true) {
                violations.push('APPROVAL_REQUIRED');
            }
        }

        const decision = violations.length === 0 ? 'promote' : 'block';
        return res.status(200).json({ decision, violations });

    } catch (error) {
        return res.status(400).json({ decision: 'block', violations: ['INVALID_PAYLOAD'] });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
