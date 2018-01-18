#import "PrinterManager.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

#define KEY_RESULT                  @"Result"
#define KEY_METHOD                  @"Method"


@implementation PrinterManager
@synthesize bridge = _bridge;
RCT_EXPORT_MODULE();

//RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
//{
//  NSLog(@"Pretending to create an event %@ at %@", name, location);
//}


RCT_EXPORT_METHOD(searchDevice:(int)userInfo) {
  
  int result = EPOS2_SUCCESS;
  
  if (userInfo == 0) {
    filteroption_  = [[Epos2FilterOption alloc] init];
    [filteroption_ setDeviceType:EPOS2_TYPE_PRINTER];
  }
  else {
    while (YES) {
      result = [Epos2Discovery stop];
      
      if (result != EPOS2_ERR_PROCESSING) {
        if (result == EPOS2_SUCCESS) {
          break;
        }
        else {
          [ShowMsg showErrorEpos:result method:@"stop"];
          return;
        }
      }
    }
  }
  
  result = [Epos2Discovery start:filteroption_ delegate:self];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"start"];
  }
}

- (void) onDiscovery:(Epos2DeviceInfo *)deviceInfo
{
  NSLog(@"%d %@ %@ %@", deviceInfo.deviceType, deviceInfo.deviceName, deviceInfo.target, deviceInfo.ipAddress);
  
  [self.bridge.eventDispatcher sendAppEventWithName:@"foundPrinter"
                                               body:@{@"name": deviceInfo.target}];
}

RCT_EXPORT_METHOD(generateReceipt:(id)data) {
  _ipTarget = data[@"ipTarget"];
  _actions = data[@"actions"];
  [self startPrint];
}

RCT_REMAP_METHOD(findEvents,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  
  NSDictionary *Printer = @{@"ip" :_ipTarget};
  NSArray *events = @[Printer];
  if (events) {
    resolve(events);
  } else {
//    NSError *error = @"erro";
//    reject(@"no_events", @"There were no events ", error);
  }
}



- (BOOL) startPrint
{
  if (![self initializeObject]) {
    return NO;
  }
  
  if (![self createReceiptData]) {
    [self finalizeObject];
    return NO;
  }
  
  if (![self printData]) {
    [self finalizeObject];
    return NO;
  }

  return YES;
}


- (BOOL)initializeObject
{
  
  printerSeries_ = EPOS2_TM_M10;
  lang_ = EPOS2_MODEL_ANK;
  
  printer_ = [[Epos2Printer alloc] initWithPrinterSeries:printerSeries_ lang:lang_];
  
  if (printer_ == nil) {
    [ShowMsg showErrorEpos:EPOS2_ERR_PARAM method:@"initiWithPrinterSeries"];
    return NO;
  }
  
  [printer_ setReceiveEventDelegate:self];
  
  return YES;
}

- (void)finalizeObject
{
  if (printer_ == nil) {
    return;
  }
  
  [printer_ clearCommandBuffer];
  
  [printer_ setReceiveEventDelegate:nil];
  
  printer_ = nil;
}

- (void) onPtrReceive:(Epos2Printer *)printerObj code:(int)code status:(Epos2PrinterStatusInfo *)status printJobId:(NSString *)printJobId
{
   [self performSelectorInBackground:@selector(disconnectPrinter) withObject:nil];
}


- (void)disconnectPrinter
{
  int result = EPOS2_SUCCESS;
  NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
  
  if (printer_ == nil) {
    return;
  }
  
  result = [printer_ endTransaction];
  if (result != EPOS2_SUCCESS) {
    [dict setObject:[NSNumber numberWithInt:result] forKey:KEY_RESULT];
    [dict setObject:@"endTransaction" forKey:KEY_METHOD];
    [self performSelectorOnMainThread:@selector(showEposErrorFromThread:) withObject:dict waitUntilDone:NO];
  }
  
  result = [printer_ disconnect];
  if (result != EPOS2_SUCCESS) {
    [dict setObject:[NSNumber numberWithInt:result] forKey:KEY_RESULT];
    [dict setObject:@"disconnect" forKey:KEY_METHOD];
    [self performSelectorOnMainThread:@selector(showEposErrorFromThread:) withObject:dict waitUntilDone:NO];
  }
  [self finalizeObject];
}

- (void)showEposErrorFromThread:(NSDictionary *)dict
{
  int result = EPOS2_SUCCESS;
  NSString *method = @"";
  result = [[dict valueForKey:KEY_RESULT] intValue];
  method = [dict valueForKey:KEY_METHOD];
  [ShowMsg showErrorEpos:result method:method];
}


- (BOOL)printData
{
  int result = EPOS2_SUCCESS;
  
  Epos2PrinterStatusInfo *status = nil;
  
  if (printer_ == nil) {
    return NO;
  }
  
  if (![self connectPrinter]) {
    return NO;
  }
  
  status = [printer_ getStatus];
  NSLog(@"%@", status);
  [self dispPrinterWarnings:status];
  
  if (![self isPrintable:status]) {
    [ShowMsg show:[self makeErrorMessage:status]];
    [printer_ disconnect];
    return NO;
  }
  
  result = [printer_ sendData:EPOS2_PARAM_DEFAULT];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"sendData"];
    [printer_ disconnect];
    return NO;
  }
  
  return YES;
}

- (NSString *)makeErrorMessage:(Epos2PrinterStatusInfo *)status
{
  NSMutableString *errMsg = [[NSMutableString alloc] initWithString:@""];
  
  if (status.getOnline == EPOS2_FALSE) {
    [errMsg appendString:NSLocalizedString(@"err_offline", @"")];
  }
  if (status.getConnection == EPOS2_FALSE) {
    [errMsg appendString:NSLocalizedString(@"err_no_response", @"")];
  }
  if (status.getCoverOpen == EPOS2_TRUE) {
    [errMsg appendString:NSLocalizedString(@"err_cover_open", @"")];
  }
  if (status.getPaper == EPOS2_PAPER_EMPTY) {
    [errMsg appendString:NSLocalizedString(@"err_receipt_end", @"")];
  }
  if (status.getPaperFeed == EPOS2_TRUE || status.getPanelSwitch == EPOS2_SWITCH_ON) {
    [errMsg appendString:NSLocalizedString(@"err_paper_feed", @"")];
  }
  if (status.getErrorStatus == EPOS2_MECHANICAL_ERR || status.getErrorStatus == EPOS2_AUTOCUTTER_ERR) {
    [errMsg appendString:NSLocalizedString(@"err_autocutter", @"")];
    [errMsg appendString:NSLocalizedString(@"err_need_recover", @"")];
  }
  if (status.getErrorStatus == EPOS2_UNRECOVER_ERR) {
    [errMsg appendString:NSLocalizedString(@"err_unrecover", @"")];
  }
  
  if (status.getErrorStatus == EPOS2_AUTORECOVER_ERR) {
    if (status.getAutoRecoverError == EPOS2_HEAD_OVERHEAT) {
      [errMsg appendString:NSLocalizedString(@"err_overheat", @"")];
      [errMsg appendString:NSLocalizedString(@"err_head", @"")];
    }
    if (status.getAutoRecoverError == EPOS2_MOTOR_OVERHEAT) {
      [errMsg appendString:NSLocalizedString(@"err_overheat", @"")];
      [errMsg appendString:NSLocalizedString(@"err_motor", @"")];
    }
    if (status.getAutoRecoverError == EPOS2_BATTERY_OVERHEAT) {
      [errMsg appendString:NSLocalizedString(@"err_overheat", @"")];
      [errMsg appendString:NSLocalizedString(@"err_battery", @"")];
    }
    if (status.getAutoRecoverError == EPOS2_WRONG_PAPER) {
      [errMsg appendString:NSLocalizedString(@"err_wrong_paper", @"")];
    }
  }
  if (status.getBatteryLevel == EPOS2_BATTERY_LEVEL_0) {
    [errMsg appendString:NSLocalizedString(@"err_battery_real_end", @"")];
  }
  
  return errMsg;
}

- (BOOL)isPrintable:(Epos2PrinterStatusInfo *)status
{
  if (status == nil) {
    return NO;
  }
  
  if (status.connection == EPOS2_FALSE) {
    return NO;
  }
  else if (status.online == EPOS2_FALSE) {
    return NO;
  }
  else {
    ;//print available
  }
  
  return YES;
}


-(BOOL)connectPrinter
{
  int result = EPOS2_SUCCESS;
  
  if (printer_ == nil) {
    return NO;
  }
  
  result = [printer_ connect:_ipTarget timeout:EPOS2_PARAM_DEFAULT];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"connect"];
    return NO;
  }
  
  result = [printer_ beginTransaction];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"beginTransaction"];
    [printer_ disconnect];
    return NO;
  }
  
  return YES;
}

- (void)dispPrinterWarnings:(Epos2PrinterStatusInfo *)status
{
  NSMutableString *warningMsg = [[NSMutableString alloc] init];
  
  if (status == nil) {
    return;
  }
  
  _textWarnings = @"";
  
  if (status.paper == EPOS2_PAPER_NEAR_END) {
    [warningMsg appendString:NSLocalizedString(@"warn_receipt_near_end", @"")];
  }
  
  if (status.batteryLevel == EPOS2_BATTERY_LEVEL_1) {
    [warningMsg appendString:NSLocalizedString(@"warn_battery_near_end", @"")];
  }
  
  _textWarnings = warningMsg;
}


//- (BOOL)createReceiptDataOld
//{
//  int result = EPOS2_SUCCESS;
//  
//  const int barcodeWidth = 2;
//  const int barcodeHeight = 100;
//  
//  if (printer_ == nil) {
//    return NO;
//  }
//  
//  NSMutableString *textData = [[NSMutableString alloc] init];
//  //UIImage *logoData = [UIImage imageNamed:@"store.png"];
//  
//  //if (textData == nil || logoData == nil) {
//  if (textData == nil) {
//    return NO;
//  }
//  
//  result = [printer_ addTextAlign:EPOS2_ALIGN_CENTER];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addTextAlign"];
//    return NO;
//  }
//  
////  result = [printer_ addImage:logoData x:0 y:0
////                        width:logoData.size.width
////                       height:logoData.size.height
////                        color:EPOS2_COLOR_1
////                         mode:EPOS2_MODE_MONO
////                     halftone:EPOS2_HALFTONE_DITHER
////                   brightness:EPOS2_PARAM_DEFAULT
////                     compress:EPOS2_COMPRESS_AUTO];
//  
////  if (result != EPOS2_SUCCESS) {
////    [ShowMsg showErrorEpos:result method:@"addImage"];
////    return NO;
////  }
//  
//  // Section 1 : Store infomation
//  result = [printer_ addFeedLine:1];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addFeedLine"];
//    return NO;
//  }
//  [textData appendString:@"THE STORE 123 (555) 555 – 5555\n"];
//  [textData appendString:@"STORE DIRECTOR – John Smith\n"];
//  [textData appendString:@"\n"];
//  [textData appendString:@"7/01/07 16:58 6153 05 0191 134\n"];
//  [textData appendString:@"ST# 21 OP# 001 TE# 01 TR# 747\n"];
//  [textData appendString:@"------------------------------\n"];
//  result = [printer_ addText:textData];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addText"];
//    return NO;
//  }
//  [textData setString:@""];
//  
//  result = [printer_ addCut:EPOS2_CUT_FEED];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addCut"];
//    return NO;
//  }
//  
//  
//  // Section 2 : Purchaced items
//  [textData appendString:@"400 OHEIDA 3PK SPRINGF  9.99 R\n"];
//  [textData appendString:@"410 3 CUP BLK TEAPOT    9.99 R\n"];
//  [textData appendString:@"445 EMERIL GRIDDLE/PAN 17.99 R\n"];
//  [textData appendString:@"438 CANDYMAKER ASSORT   4.99 R\n"];
//  [textData appendString:@"474 TRIPOD              8.99 R\n"];
//  [textData appendString:@"433 BLK LOGO PRNTED ZO  7.99 R\n"];
//  [textData appendString:@"458 AQUA MICROTERRY SC  6.99 R\n"];
//  [textData appendString:@"493 30L BLK FF DRESS   16.99 R\n"];
//  [textData appendString:@"407 LEVITATING DESKTOP  7.99 R\n"];
//  [textData appendString:@"441 **Blue Overprint P  2.99 R\n"];
//  [textData appendString:@"476 REPOSE 4PCPM CHOC   5.49 R\n"];
//  [textData appendString:@"461 WESTGATE BLACK 25  59.99 R\n"];
//  [textData appendString:@"------------------------------\n"];
//  
//  result = [printer_ addText:textData];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addText"];
//    return NO;
//  }
//  [textData setString:@""];
//  
//  // Section 3 : Payment infomation
//  [textData appendString:@"SUBTOTAL                160.38\n"];
//  [textData appendString:@"TAX                      14.43\n"];
//  result = [printer_ addText:textData];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addText"];
//    return NO;
//  }
//  [textData setString:@""];
//  
//  result = [printer_ addTextSize:2 height:2];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addTextSize"];
//    return NO;
//  }
//  
//  result = [printer_ addText:@"TOTAL    174.81\n"];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addText"];
//    return NO;
//  }
//  
//  result = [printer_ addTextSize:1 height:1];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addTextSize"];
//    return NO;
//  }
//  
//  result = [printer_ addFeedLine:1];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addFeedLine"];
//    return NO;
//  }
//  
//  [textData appendString:@"CASH                    200.00\n"];
//  [textData appendString:@"CHANGE                   25.19\n"];
//  [textData appendString:@"------------------------------\n"];
//  result = [printer_ addText:textData];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addText"];
//    return NO;
//  }
//  [textData setString:@""];
//  
//  // Section 4 : Advertisement
//  [textData appendString:@"Purchased item total number\n"];
//  [textData appendString:@"Sign Up and Save !\n"];
//  [textData appendString:@"With Preferred Saving Card\n"];
//  result = [printer_ addText:textData];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addText"];
//    return NO;
//  }
//  [textData setString:@""];
//  
//  result = [printer_ addFeedLine:2];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addFeedLine"];
//    return NO;
//  }
//  
//  result = [printer_ addBarcode:@"01209457"
//                           type:EPOS2_BARCODE_CODE39
//                            hri:EPOS2_HRI_BELOW
//                           font:EPOS2_FONT_A
//                          width:barcodeWidth
//                         height:barcodeHeight];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addBarcode"];
//    return NO;
//  }
//  
//  result = [printer_ addCut:EPOS2_CUT_FEED];
//  if (result != EPOS2_SUCCESS) {
//    [ShowMsg showErrorEpos:result method:@"addCut"];
//    return NO;
//  }
//  
//  return YES;
//}


- (BOOL)createReceiptData
{
  int result = EPOS2_SUCCESS;
  if (printer_ == nil) return NO;
  
  NSMutableString *textData = [[NSMutableString alloc] init];
  if (textData == nil) return NO;
  
  result = [printer_ addTextSmooth:YES];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"addTextSmooth"];
    return NO;
  }
  
  if (![self setTextPosition:EPOS2_ALIGN_CENTER]) return NO;
  
  if (![self setTextSize:2]) return NO;
  [textData appendString:@"PARAPHARMACIE VERT\n"];
  [self addText:textData];
  [textData setString:@""];
  if (![self setTextSize:1]) return NO;
  
  [textData appendString:@"39 RUE HENRI GAUTIER\n"];
  [textData appendString:@"93000 BOBIGNY\n"];
  [textData appendString:@"TEL: 01 48 91 88 88\n"];
  [self addText:textData];
  [textData setString:@""];
  
  for (int i = 0; i < _actions.count; i++)
  {
    if (_actions[i][@"addLine"] != nil)
    {
      if ([_actions[i][@"addLine"] intValue] > 0)
        if (![self addLine:[_actions[i][@"addLine"] intValue]])
          return NO;
    }
    else if (_actions[i][@"subHeader"] != nil)
    {
      if ([_actions[i][@"subHeader"] count] > 0)
        if (![self subHeader:_actions[i][@"subHeader"]])
          return NO;
    }
    else if (_actions[i][@"addDash"] != nil)
    {
      if (_actions[i][@"addDash"])
        if (![self addDash])
          return NO;
    }
    else if (_actions[i][@"products"] != nil)
    {
      if ([_actions[i][@"products"] count] > 0)
        if (![self addProducts:_actions[i][@"products"]])
          return NO;
    }
    else if (_actions[i][@"amount"] != nil)
    {
        if (![self addAmount:_actions[i][@"amount"]])
          return NO;
    }
    else if (_actions[i][@"subFooter"] != nil)
    {
      if (![self addSubFooter:_actions[i][@"subFooter"]])
        return NO;
    }
    else if (_actions[i][@"footer"] != nil)
    {
      if (![self addFooter:_actions[i][@"footer"]])
        return NO;
    }
  }
  
  
  // CUT
  result = [printer_ addCut:EPOS2_CUT_FEED];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"addCut"];
    return NO;
  }

  return YES;
}


- (BOOL)addLine:(int)line
{
    int result = EPOS2_SUCCESS;
    result = [printer_ addFeedLine:line];
    if (result != EPOS2_SUCCESS) {
      [ShowMsg showErrorEpos:result method:@"addFeedLine"];
      return NO;
    }
    return YES;
}

- (BOOL)subHeader:(NSArray *)info
{
  if (![self setTextPosition:EPOS2_ALIGN_LEFT]) return NO;
  NSMutableString *textData = [[NSMutableString alloc] init];
  for (int i = 0; i < info.count; i++) {
    [textData appendString:[NSString stringWithFormat:@"%@ ", info[i]]];
  }
  [textData appendString:@"\n"];
  
  if (![self addText:textData]) return NO;
  if (![self setTextPosition:EPOS2_ALIGN_CENTER]) return NO;
  return YES;
}

- (BOOL)addSubFooter:(NSArray *)info
{
  NSMutableString *textData = [[NSMutableString alloc] init];
  for (int i = 0; i < info.count; i++) {
    [textData appendString:[NSString stringWithFormat:@"%@\n", info[i]]];
  }
  return [self addText:textData];
}


- (BOOL)addFooter:(NSArray *)info
{
  NSMutableString *textData = [[NSMutableString alloc] init];
  for (int i = 0; i < info.count; i++) {
    [textData appendString:[NSString stringWithFormat:@"%@\n", info[i]]];
  }
  
  return [self addText:textData];
}

- (BOOL)addDash {
  NSMutableString *textData = [[NSMutableString alloc] init];
  [textData appendString:@"------------------------------------------------\n"];
  return [self addText:textData];
}

-(BOOL)addProducts:(NSArray *)info{
  
  if (![self setTextPosition:EPOS2_ALIGN_LEFT]) return NO;
  
  NSMutableString *textData = [[NSMutableString alloc] init];
  for (int i=0; i< info.count ; i++) {
  
    [textData setString:@""];
    [printer_ addHPosition:10];
    [textData appendString:[NSString stringWithFormat:@"%@  ",info[i][@"quantity"]]];
    if (![self addText:textData]) return NO;
    
    [textData setString:@""];
    [printer_ addHPosition:70];
    [textData appendString:[NSString stringWithFormat:@"%@  ",info[i][@"name"]]];
    if (![self addText:textData]) return NO;
    
    [textData setString:@""];
    [printer_ addHPosition:[self getTextPosition:info[i][@"price_ttc"]]];
    [textData appendString:[NSString stringWithFormat:@"%@  ",info[i][@"price_ttc"]]];
    if (![self addText:textData]) return NO;
    
    [textData setString:@""];
    [printer_ addHPosition:[self getTextPosition:info[i][@"totalTtc"]] + 100];
    [textData appendString:[NSString stringWithFormat:@"%@\n", info[i][@"totalTtc"]]];
     if (![self addText:textData]) return NO;
  }
  
  if (![self setTextPosition:EPOS2_ALIGN_CENTER]) return NO;
  return YES;
}

-(BOOL)addAmount:(NSDictionary *)info{
  if (![self setTextPosition:EPOS2_ALIGN_RIGHT]) return NO;
  NSMutableString *textData = [[NSMutableString alloc] init];
  [textData appendString:[NSString stringWithFormat:@"TOTAL TTC: %@\n", info[@"totalTtc"]]];
  //if (![info[@"Remise"] isEqualToString:@"0"]) {
    [textData appendString:[NSString stringWithFormat:@"MONTANT REMISE: %@ (-%@%%)\n", info[@"totalRemise"], info[@"Remise"]]];
  //}
  if (![self addText:textData]) return NO;
  [textData setString:@""];
  if (![self setTextSize:2]) return NO;
  [textData appendString:[NSString stringWithFormat:@"NET A PAYE: %@\n", info[@"totalNet"]]];
  if (![self addText:textData]) return NO;
  if (![self setTextPosition:EPOS2_ALIGN_CENTER]) return NO;
  if (![self setTextSize:1]) return NO;
  return YES;
}


- (NSInteger)getTextPosition:(NSString*)text
{
  switch ([text length]) {
    case 4:
      return 426;
      break;
      
    case 5:
      return 414;
      break;
      
    case 6:
      return 402;
      break;
      
    case 7:
      return 390;
      break;
      
    case 8:
      return 378;
      break;
      
    default:
      return 400;
      break;
  }
}


- (BOOL)addText:(NSString *)textData {
  int result = EPOS2_SUCCESS;
  result = [printer_ addText:textData];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"addTextSize"];
    return NO;
  }
  return YES;
}

-(BOOL)setTextSize:(NSInteger) size{
  int result = EPOS2_SUCCESS;
  result = [printer_ addTextSize:size height:size];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"addTextSize"];
    return NO;
  }
  return YES;
}
- (BOOL)setTextPosition:(int) position {
  int result = EPOS2_SUCCESS;
  result = [printer_ addTextAlign:position];
  if (result != EPOS2_SUCCESS) {
    [ShowMsg showErrorEpos:result method:@"addTextAlign"];
    return NO;
  }
  return YES;
}
@end