let {_, SERVER_HOSTNAME} = window;
let seiku = -1, eSlot = [], eKyouka = [], dock_id = 0, ship_id = [], ship_ke = [], mapinfo_no = -1, cell_ids = [], maparear_id = -1;
import { reportInit, reportEnemy,
    reportShipAttr, reportShipAttrByLevelUp, whenMapStart,
    whenRemodel,reportGetLoseItem,
    reportInitEquipByDrop, reportInitEquipByBuild,
    reportInitEquipByRemodel, whenBattleResult,
    reoprtTyku, cacheSync, reportBattle, reportBattleV2} from './report';
let handleBattleResult = (e) => {
    if (seiku != -1) {
        let { rank, map, mapCell, dropShipId, deckShipId } = e.detail;
        let { _teitokuLv, _nickName, _nickNameId, _decks, _ships } = window;
        whenBattleResult(_decks, _ships);
        reoprtTyku(eSlot, eKyouka, e.detail, seiku, dock_id, ship_id);
        seiku = -1;
        eSlot = []; eKyouka = [];
    }
};
let handleGameResponse = (e) => {
    let {method, path, body, postBody} = e.detail? e.detail : e;
    let {_ships, _decks, _teitokuLv, _nickName, _nickNameId} = window;
    switch (path) {
        case '/kcsapi/api_req_combined_battle/battle':
        case '/kcsapi/api_req_sortie/battle':
        case '/kcsapi/api_req_combined_battle/airbattle':
        case '/kcsapi/api_req_sortie/airbattle':
        case '/kcsapi/api_req_combined_battle/ld_airbattle':
        case '/kcsapi/api_req_combined_battle/midnight_battle':
        case '/kcsapi/api_req_combined_battle/sp_midnight':
        case '/kcsapi/api_req_battle_midnight/battle':
        case '/kcsapi/api_req_battle_midnight/sp_midnight':
        case '/kcsapi/api_req_combined_battle/battle_water':
        case '/kcsapi/api_req_combined_battle/ec_battle':
        case '/kcsapi/api_req_combined_battle/ec_midnight_battle':
        case '/kcsapi/api_req_combined_battle/each_battle':
        case '/kcsapi/api_req_combined_battle/each_battle_water':
        case '/kcsapi/api_req_combined_battle/ec_night_to_day':
            if (typeof body.api_ship_ke !== "undefined" && body.api_ship_ke !== null)
                ship_ke = body.api_ship_ke;
            if (typeof body.api_kouku !== "undefined" && body.api_kouku !== null 
            && typeof body.api_kouku.api_stage1 !== "undefined" && body.api_kouku.api_stage1 !== null
            && typeof body.api_kouku.api_stage1.api_disp_seiku !== "undefined" 
            && body.api_kouku.api_stage1.api_disp_seiku !== null)
                seiku = body.api_kouku.api_stage1.api_disp_seiku || -1;
            if (typeof body.api_eSlot !== "undefined" && body.api_eSlot !== null)
                eSlot = body.api_eSlot;
            if (typeof body.api_eKyouka !== "undefined" && body.api_eKyouka !== null)
                eKyouka = body.api_eKyouka;
            if (typeof body.api_dock_id !== "undefined" && body.api_dock_id !== null)
                dock_id = body.api_dock_id;
            /*
            在20171117更新中，至少
            '/kcsapi/api_req_sortie/battle'
            的api中的api_dock_id修改了拼写，变为api_deck_id，导致dock_id没有被正确赋值
            */
            if (typeof body.api_deck_id !== "undefined" && body.api_deck_id !== null)
                dock_id = body.api_deck_id;
            reportEnemy(body);
            break;
        case '/kcsapi/api_port/port':
            reportBattle(mapinfo_no, maparear_id, cell_ids, _decks, dock_id, _ships);
            reportBattleV2(mapinfo_no, maparear_id, cell_ids, dock_id);
            cell_ids = [];
        case '/kcsapi/api_get_member/ship_deck':
            reportShipAttrByLevelUp(path);
            reportInitEquipByRemodel();
            cacheSync();
            break;
        case '/kcsapi/api_req_map/start':
            mapinfo_no = body.api_mapinfo_no;
            maparear_id = body.api_maparea_id;
            cell_ids.push(body.api_no);
            whenMapStart(_decks, _ships, _slotitems);
            reportGetLoseItem(body);
            break;
        case '/kcsapi/api_req_map/next':
            cell_ids.push(body.api_no);
            reportGetLoseItem(body);
            break;
        case '/kcsapi/api_get_member/material':
            reportInitEquipByRemodel();
            break;
        case '/kcsapi/api_get_member/slot_item':
            reportInitEquipByDrop(_ships);
            break;
        case '/kcsapi/api_req_kousyou/getship':
            reportShipAttr(body.api_ship);
            reportInitEquipByBuild(body, _ships);
            break;
        //case '/kcsapi/api_req_kaisou/powerup':
        //    reportShipAttr(body.api_ship);
        //    whenRemodel(body);
        //    break;
        //case 'api_req_kaisou/marriage':
        //    reportShipAttr(body.api_data);
        //    break;
    }
};
let handleGameRequest = (e) => {
    let {method, path, body} = e.detail? e.detail : e;
    switch(path) {
        case '/kcsapi/api_req_kaisou/remodeling':
            whenRemodel(body);
            break;
    }
};
export const
    pluginDidLoad = (e) => {
        reportInit();
        window.addEventListener('game.response', handleGameResponse);
        window.addEventListener('game.request', handleGameRequest);
        window.addEventListener('battle.result', handleBattleResult);
    },
    pluginWillUnload = (e) => {
        window.removeEventListener('game.response', handleGameResponse);
        window.removeEventListener('game.request', handleGameRequest);
        window.removeEventListener('battle.result', handleBattleResult);
    },
    show = false;

