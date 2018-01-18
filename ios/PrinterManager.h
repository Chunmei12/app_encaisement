#import "RCTBridgeModule.h"
#import "ePOS2.h"
#import "ShowMsg.h"

@interface PrinterManager : NSObject <RCTBridgeModule> {
  Epos2FilterOption *filteroption_;
  Epos2Printer *printer_;
  int printerSeries_;
  int lang_;
}

@property(weak, nonatomic) NSString *textTarget;
@property(weak, nonatomic) NSString *ipTarget;
@property(weak, nonatomic) NSString *textWarnings;
@property(weak, nonatomic) NSMutableArray *actions;


@end