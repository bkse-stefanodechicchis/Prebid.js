import { registerBidder } from 'src/adapters/bidderFactory';
import { BANNER } from 'src/mediaTypes';

const WHOIS = 'BKSHBID-008';
const BIDDER_CODE = 'bucksense';
const URL = 'https://prebid.bksn.se:445/prebid';
var bksdebug = false;

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER],

  /**
   * Determines whether or not the given bid request is valid.
   *
   * @param {object} bid The bid to validate.
   * @return boolean True if this is a valid bid, and false otherwise.
  */
  isBidRequestValid: function (bid) {
    if (isNaN(bid)) {
      return false;
    }
    if (bid.params.debug) {
      bksdebug = bid.params.debug;
    }
    if (bksdebug) console.log(WHOIS + ' isBidRequestValid() - INPUT bid:', bid);
    return Boolean(bid.bidId && bid.params && !isNaN(bid.params.placementId));
  },

  /**
    * Make a server request from the list of BidRequests.
    *
    * @param {BidRequest[]} validBidRequests A non-empty list of valid bid requests that should be sent to the Server.
    * @return ServerRequest Info describing the request to the server.
   */
  buildRequests: function (validBidRequests, bidderRequest) {
    if (bksdebug) console.log(WHOIS + ' buildRequests() - INPUT validBidRequests:', validBidRequests, 'INPUT bidderRequest:', bidderRequest);
    let requests = [];

    const len = validBidRequests.length;
    for (let i = 0; i < len; i++) {
      var bid = validBidRequests[i];

      requests.push({
        method: 'POST',
        url: URL,
        data: {
          'pub_id': location.host,
          'pl_id': bid.params.placementId,
          'sys_href': encodeURI(location.href),
          'sys_bid_id': bid.bidId,
          'test_cpm': bid.params.testcpm
        }
      })
    }
    if (bksdebug) console.log(WHOIS + ' buildRequests() - requests:', requests);
    return requests;
  },

  /**
   * Unpack the response from the server into a list of bids.
   *
   * @param {*} serverResponse A successful response from the server.
   * @return {Bid[]} An array of bids which were nested inside the server.
  */
  interpretResponse: function (serverResponse, request) {
    if (bksdebug) console.log(WHOIS + ' interpretResponse() - INPUT serverResponse:', serverResponse, 'INPUT request:', request);

    const bidResponses = [];

    if (serverResponse.body) {
      var oResponse = serverResponse.body;

      var sRequestID = oResponse.requestId || '';
      var nCPM = oResponse.cpm || 0;
      var nWidth = oResponse.width || 0;
      var nHeight = oResponse.height || 0;
      var nTTL = oResponse.ttl || 0;
      var sCreativeID = oResponse.creativeId || 0;
      var sCurrency = oResponse.currency || 'USD';
      var bNetRevenue = oResponse.netRevenue || true;
      var sAd = oResponse.ad || '';

      if (sRequestID.length == 0 && !isNaN(request)) {
        if (bksdebug) console.log(WHOIS + ' interpretResponse() - use RequestID from Placments');
        sRequestID = request.data.sys_bid_id || '';
      }

      if (!isNaN(request) && request.data.test_cpm > 0) {
        if (bksdebug) console.log(WHOIS + ' interpretResponse() - use Test CPM ');
        nCPM = request.data.test_cpm;
      }

      let bidResponse = {
        requestId: sRequestID,
        cpm: nCPM,
        width: nWidth,
        height: nHeight,
        ttl: nTTL,
        creativeId: sCreativeID,
        currency: sCurrency,
        netRevenue: bNetRevenue,
        ad: sAd
      };
      bidResponses.push(bidResponse);
    } else {
      if (bksdebug) console.log(WHOIS + ' interpretResponse() - serverResponse not valid');
    }
    if (bksdebug) console.log(WHOIS + ' interpretResponse() - return', bidResponses);
    return bidResponses;
  },

  /**
   * ...
   *
   * @param {object} bid The bid to validate.
   * @return ...
  */
  onSetTargeting: function (bid) {
    if (bksdebug) console.log(WHOIS + ' onSetTargeting() - INPUT bid:', bid);
  },

  /**
  * Register the user sync pixels which should be dropped after the auction.
  *
  * @param {SyncOptions} syncOptions Which user syncs are allowed?
  * @param {ServerResponse[]} serverResponses List of server's responses.
  * @return {UserSync[]} The user syncs which should be dropped.
  */
  getUserSyncs: function(syncOptions, serverResponses) {
    if (bksdebug) console.log(WHOIS + ' getUserSyncs() - INPUT syncOptions:', syncOptions, 'INPUT serverResponses:', serverResponses);
    const syncs = []
    /*
    if (syncOptions.iframeEnabled) {
      syncs.push({
        type: 'iframe',
        url: '//'
      });
    }
    if (syncOptions.pixelEnabled && serverResponses.length > 0) {
      syncs.push({
        type: 'image',
        url: serverResponses[0].body.userSync.url
      });
    }
    */
    return syncs;
  },

  /**
   * ...
   *
   * @param {object} bid The bid to validate.
   * @return ...
  */
  onBidWon: function(bid) {
    if (bksdebug) console.log(WHOIS + ' onBidWon() - INPUT bid:', bid);
  },

  /**
   * ...
   *
   * @param ...
   * @return ...
  */
  onTimeout: function(timeoutData) {
    if (bksdebug) console.log(WHOIS + ' onTimeout() - INPUT timeoutData:', timeoutData);
  },
};

registerBidder(spec);
