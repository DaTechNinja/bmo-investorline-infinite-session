// ==UserScript==
// @name         BMO Investorline Infinite Session
// @namespace    https://openuserjs.org/scripts/
// @description  Disables 15 minute session inactivity logout on BMO InvestorLine. Stay logged in as long as you want!
// @author       DaTechNinja
// @version      1.0
// @encoding     utf-8
// @license      https://raw.githubusercontent.com/DaTechNinja/bmo-investorline-infinite-session/master/LICENSE
// @icon         https://raw.githubusercontent.com/DaTechNinja/bmo-investorline-infinite-session/master/favicon.ico
// @homepage     https://github.com/DaTechNinja/bmo-investorline-infinite-session/
// @supportURL   https://github.com/DaTechNinja/bmo-investorline-infinite-session/issues
// @updateURL    https://raw.githubusercontent.com/DaTechNinja/bmo-investorline-infinite-session/master/bmo-investorline-infinite-session.js
// @downloadURL  https://raw.githubusercontent.com/DaTechNinja/bmo-investorline-infinite-session/master/bmo-investorline-infinite-session.js
// @match        https://www.secure.bmoinvestorline.com/ILClientWeb/client/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.4.7/bluebird.min.js
// ==/UserScript==

/* BMO InvestorLine by default has a 15 minute session timeout for standard accounts.

   "We offer timeout extension to clients with 5 Star Gold or Platinum status. Clients with Gold or Platinum status may increase the online session timeout settings to 30 or 60 minutes"

   This offers unlimited session time for no extra cost.

   DISCLAIMER: BMO, BMO Bank of Montreal, Bank of Montreal, BMO InvestorLine and BMO Wealth Management are registered and unregistered trademarks of BMO Financial Group in Canada, the United States and/or other countries.
*/

(function() {
    'use strict';

    $(document).ready(function() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var localStorageRegex = /"\w{8}-\w{4}-\w{4}-\w{4}-\w{12}"/;
        var navigationForm = $('#submitform');

        // Null functions that cause session about to expire pop-ups
        window.ResetSessionAlive = function(){};
        window.keepAlive = function(timeoutMin){};
        window.SessionTimeoutReached = function(){};

        // Clear timeouts which call above functions
        if (window.sessionTimeoutID != 'undefined') { clearTimeout(window.sessionTimeoutID); }
        if (window.SessionTimeoutReached != 'undefined') { clearTimeout(window.SessionTimeoutReached); }

        // Refresh our session randomly between 30 seconds to 3 minutes to keep session active
        function sessionLoop() {
            var sleepInterval = getRandomInt(30000, 180000);

            return Promise.delay(sleepInterval).then(function() {
                // Load the home page to prevent server side expiration
                navigationForm.find('input[name="method"]').val('displayHome');

                $.post('https://www.secure.bmoinvestorline.com/ILClientWeb/client/home.do', navigationForm.serializeArray(), function(data, status) {});

                // Reset local web storage expiration times to prevent client side expiration
                var currentTime = new Date();
                var localStorageTimestamp1 = currentTime.getTime() + 600000;
                var localStorageTimestamp2 = currentTime.getTime() + 86400000;

                for (var i in localStorage) {
                    var storageData = JSON.parse(localStorage[i]);

                    if (storageData.val.match(localStorageRegex)) {
                        storageData.exp = localStorageTimestamp2;
                    } else {
                        storageData.exp = localStorageTimestamp1;
                    }

                    localStorage.setItem(i, JSON.stringify(storageData));
                }

                return sessionLoop();
            });
        }

        sessionLoop();
    });
})();
