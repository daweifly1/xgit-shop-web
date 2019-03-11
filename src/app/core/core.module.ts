import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgZorroAntdModule} from 'ng-zorro-antd';

import {HttpUtilService} from './infra/http/http-util.service';

import {DefaultInterceptor, UfastCodeInterceptor} from './infra/interceptors/default.interceptor';
import {UfastValidatorsService} from './infra/validators/validators.service';
import {UfastValidatorsRuleService} from './infra/validators/validatorsRule.service';

import {UserService} from './common-services/user.service';
import {MenuService} from './common-services/menu.service';
import {ScepterService} from './common-services/scepter.service';
import {DeptService} from './common-services/dept.service';
import {DictionaryService} from '../core/common-services/dictionary.service';


import {RouteReuseStrategy} from '@angular/router';
import {UfastReuseStrategy, UfastTabsetRouteService} from './infra/ufast-tabset-route.service';
import {NewsService} from './common-services/news.service';

import {CarouselService} from './trans/carousel.service';
import {NavigationService} from './trans/navigation.service';
import {IndexpicService} from './trans/indexpic.service';
import {VendorService} from './trans/vendor.service';
import {UfastUtilService} from './infra/ufast-util.service';
import {InvoiceService} from './trans/invoice.service';
import {WarehouseService} from './trans/warehouse.service';
import {OtherwarehouseService} from './trans/otherwarehouse.service';
import {LodopPrintService} from './infra/lodop-print.service';
import {PrintService} from './trans/print.service';
import {BeginningWarehouseService} from './trans/beginningWarehouse.service';
import {MaterialManageService} from './trans/materialManage.service';
import {InventoryService} from './trans/inventory.service';
import {AbnormalOutService} from './trans/abnormalOut.service';
import {BillTypeService} from './trans/billType.service';
import {DevanningPrintService} from './trans/devanningPrint.service';
import {PackBarcodePatchService} from './trans/packBarcodePatch.service';
import {BasisCodeService} from './trans/basisCode.service';
import {ReceivingNoteService} from './trans/receiving-note.service';
import {DispatchBillService} from './trans/dispatch-bill.service';
import {WarehouseWarrantService} from './trans/warehouseWarrant.service';
import {PickingApplyService} from './trans/picking-apply.service';
import {FactoryMineService} from './trans/factoryMine.service';
import {PickingDeliveryService} from './trans/picking-delivery.service';
import {MaterialDivisionManagementService} from './trans/material/MaterialDivisionManagementService';
import {RegionalAllocationService} from '../core/trans/regionalAllocation.service';
import {SupplierInfoService} from './trans/supplier-info.service';
import {PurchaseOutService} from './trans/purchase-out.service';
import {SupplierManageService} from './trans/supplier-manage.service';
import {PurchaseService} from './trans/purchase.service';
import {PurchaseContractService} from './trans/purchase-contract.service';
import {NegotiationPlanService} from './trans/negotiation-plan.service';
import {PurchaseConfirmationService} from './trans/purchase-confirmation.service';
import {ApprovalFormService} from './trans/purchase/approval-form.service';
import {ContractClauseTemplateService} from './trans/purchase/contract-clause-template.service';
import {ContractClauseListService} from './trans/purchase/contract-clause-list.service';
import {NegotiationMinutesService} from './trans/purchase/negotiation-minutes.service';
import {SourcingQuotationService} from './trans/purchase/sourcing-quotation.service';
import {SourcingInquiryService} from './trans/purchase/sourcing-inquiry.service';
import {AgreementMaterialrefService} from './trans/warehouse/agreement-materialref.service';
import {AgreementSettlementService} from './trans/warehouse/agreement-settlement.service';
import {EquipmentModelService} from './trans/material/equipment-model.service';
import {WorkBoardService} from './trans/work-board.service';
import {AuthService} from './common-services/auth.service';
import {PlanToReturnService} from './trans/purchase/plan-to-return.service';
import {UserLeaveService} from './trans/internal/user-leave.service';
import {CoreIndexService} from './trans/purchase/core-index.service';
import {RoleService} from './common-services/role.service';
import {GoodsCategoryService} from './common-services/goods-category.service';
import {GoodsAttributeService} from './common-services/goods-attribute.service';
import {GoodsService} from './common-services/goods.service';

/**
 * 定义拦截器顺序，
 * 参考：https://angular.cn/guide/http#interceptor-order
 **/
const httpInterceptorProvider = [
  {provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: UfastCodeInterceptor, multi: true}
];


@NgModule({
  imports: [
    HttpClientModule,
    NgZorroAntdModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: UfastReuseStrategy},
    HttpUtilService,
    httpInterceptorProvider,
    UserService,
    MenuService,
    ScepterService,
    DeptService,
    NewsService,
    UfastValidatorsService,
    UfastValidatorsRuleService,
    UfastTabsetRouteService,
    CarouselService,
    VendorService,
    IndexpicService,
    UfastUtilService,
    NavigationService,
    InvoiceService,
    WarehouseService,
    LodopPrintService,
    PrintService,
    OtherwarehouseService,
    BeginningWarehouseService,
    MaterialManageService,
    InventoryService,
    AbnormalOutService,
    BillTypeService,
    DevanningPrintService,
    PackBarcodePatchService,
    ReceivingNoteService,
    BasisCodeService,
    DispatchBillService,
    WarehouseWarrantService,
    PickingApplyService,
    FactoryMineService,
    PickingDeliveryService,
    MaterialDivisionManagementService,
    RegionalAllocationService,
    SupplierInfoService,
    DictionaryService,
    PurchaseOutService,
    SupplierManageService,
    PurchaseService,
    PurchaseContractService,
    NegotiationPlanService,
    PurchaseConfirmationService,
    ApprovalFormService,
    ContractClauseTemplateService,
    ContractClauseListService,
    NegotiationMinutesService,
    SourcingQuotationService,
    SourcingInquiryService,
    AgreementMaterialrefService,
    AgreementSettlementService,
    EquipmentModelService,
    WorkBoardService,
    PlanToReturnService,
    UserLeaveService,
    CoreIndexService,
    AuthService,
    RoleService,
    GoodsCategoryService,
    GoodsAttributeService,
    GoodsService

  ]
})
export class CoreModule {
}
