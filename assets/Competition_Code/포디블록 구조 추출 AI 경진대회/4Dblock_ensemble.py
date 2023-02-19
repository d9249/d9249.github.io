# python 4Dblock_ensemble.py -m_0=dm_nfnet_f0 -m_1=dm_nfnet_f1 -m_2=dm_nfnet_f2 -m_3=dm_nfnet_f3 -bs_0=60 -bs_1=40 -bs_2=20 -bs_3=10 -e=1 -ts=0.5 -lr=1e-4 -wd=1e-6 -train_is=300 -test_is=300 -p=0.80
import random, os, cv2, timm, wandb, torch, warnings, argparse, datetime, telegram
import pandas as pd
import numpy as np
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import albumentations as A
from albumentations.pytorch.transforms import ToTensorV2
from tqdm.auto import tqdm
from sklearn.metrics import *

warnings.filterwarnings(action='ignore') 
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

parser = argparse.ArgumentParser()
parser.add_argument('--model_name_0', '-m_0', required=True, type=str, help='model_name을 입력하세요 (str)')
parser.add_argument('--model_name_1', '-m_1', required=True, type=str, help='model_name을 입력하세요 (str)')
parser.add_argument('--model_name_2', '-m_2', required=True, type=str, help='model_name을 입력하세요 (str)')
parser.add_argument('--model_name_3', '-m_3', required=True, type=str, help='model_name을 입력하세요 (str)')
# parser.add_argument('--model_name_4', '-m_4', required=True, type=str, help='model_name을 입력하세요 (str)')
parser.add_argument('--batch_size_0', '-bs_0', required=True, type=int, help='batch_size을 입력하세요 (int)')
parser.add_argument('--batch_size_1', '-bs_1', required=True, type=int, help='batch_size을 입력하세요 (int)')
parser.add_argument('--batch_size_2', '-bs_2', required=True, type=int, help='batch_size을 입력하세요 (int)')
parser.add_argument('--batch_size_3', '-bs_3', required=True, type=int, help='batch_size을 입력하세요 (int)')
# parser.add_argument('--batch_size_4', '-bs_4', required=True, type=int, help='batch_size을 입력하세요 (int)')
parser.add_argument('--epochs', '-e', required=True, type=int, help='epochs을 입력하세요 (int)')
parser.add_argument('--threshold', '-ts', required=True, type=float, help='threshold를 입력하세요 (float)')
parser.add_argument('--learning_rate', '-lr', required=True, type=float, help='LEARNING_RATE를 입력하세요 (float)')
parser.add_argument('--weight_decay', '-wd', required=True, type=float, help='weight_decay를 입력하세요 (float)')
parser.add_argument('--percentage', '-p', required=True, type=float, help='percentage를 입력하세요 (float)')
parser.add_argument('--train_image_size', '-train_is', required=True, type=int, help='train_image_size를 입력하세요 (int)')
parser.add_argument('--test_image_size', '-test_is', required=True, type=int, help='test_image_size를 입력하세요 (int)')
args = parser.parse_args()

CFG = {
    'MODEL_NAME_0': args.model_name_0,
    'BATCH_SIZE_0': args.batch_size_0,
    'MODEL_NAME_1': args.model_name_1,
    'BATCH_SIZE_1': args.batch_size_1,
    'MODEL_NAME_2': args.model_name_2,
    'BATCH_SIZE_2': args.batch_size_2,
    'MODEL_NAME_3': args.model_name_3,
    'BATCH_SIZE_3': args.batch_size_3,
    # 'MODEL_NAME_4': args.model_name_4,
    # 'BATCH_SIZE_4': args.batch_size_4,
    'TRAIN_IMAGE_SIZE': args.train_image_size,
    'TEST_IMAGE_SIZE': args.test_image_size,
    'EPOCHS': args.epochs,
    'THRESHOLD': args.threshold,
    'LEARNING_RATE': args.learning_rate,
    'WEIGHT_DECAY': args.weight_decay,
    'PERCENTAGE': args.percentage,
    'IMG_SIZE': 300,
    'SEED': 2023
}

def seed_everything(seed):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = True

def get_labels(df):
    return df.iloc[:,2:].values
    
seed_everything(CFG['SEED'])
wandb.init(project="4Dblock", entity="d9249", config=CFG)

# API_KEY = '5460651923:AAEqFadVyBchYkMIisuxzYSDr08OR3SsGWw'
# bot = telegram.Bot(token = API_KEY)
# chat_id = "919256253"
# updates = bot.getUpdates()

test = pd.read_csv('./test.csv')
submit = pd.read_csv('./sample_submission.csv')
df = pd.read_csv('./train.csv')
df = df.sample(frac = 1, replace = True, random_state = CFG['SEED'])
train_len = int(len(df) * CFG['PERCENTAGE'])
train = df[:train_len]
val = df[train_len:]
train_labels = get_labels(train)
val_labels = get_labels(val)    
train_date = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
os.mkdir('./pth/'+CFG['MODEL_NAME_0']+'_'+CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2'] + '_' + CFG['MODEL_NAME_3']+ '_' + train_date)

class CustomDataset(Dataset):
    def __init__(self, img_path_list, label_list, transforms=None):
        self.img_path_list = img_path_list
        self.label_list = label_list
        self.transforms = transforms
        
    def __getitem__(self, index):
        img_path = self.img_path_list[index]
        
        image = cv2.imread(img_path)
        
        if self.transforms is not None:
            image = self.transforms(image=image)['image']
        
        if self.label_list is not None:
            label = torch.FloatTensor(self.label_list[index])
            return image, label
        else:
            return image
        
    def __len__(self):
        return len(self.img_path_list)

    
class BaseModel_0(nn.Module):
    def __init__(self, num_classes=10):
        super(BaseModel_0, self).__init__()
        self.backbone = timm.create_model(CFG['MODEL_NAME_0'], pretrained=True)
        self.classifier = nn.Linear(1000, num_classes)
        # self.classifier = nn.Linear(21841, num_classes)
        
    def forward(self, x):
        x = self.backbone(x)
        x = F.sigmoid(self.classifier(x))
        return x    

class BaseModel_1(nn.Module):
    def __init__(self, num_classes=10):
        super(BaseModel_1, self).__init__()
        self.backbone = timm.create_model(CFG['MODEL_NAME_1'], pretrained=True)
        self.classifier = nn.Linear(1000, num_classes)
        # self.classifier = nn.Linear(21841, num_classes)
        
    def forward(self, x):
        x = self.backbone(x)
        x = F.sigmoid(self.classifier(x))
        return x
    
class BaseModel_2(nn.Module):
    def __init__(self, num_classes=10):
        super(BaseModel_2, self).__init__()
        self.backbone = timm.create_model(CFG['MODEL_NAME_2'], pretrained=True)
        self.classifier = nn.Linear(1000, num_classes)
        # self.classifier = nn.Linear(21841, num_classes)
        
    def forward(self, x):
        x = self.backbone(x)
        x = F.sigmoid(self.classifier(x))
        return x
    
class BaseModel_3(nn.Module):
    def __init__(self, num_classes=10):
        super(BaseModel_3, self).__init__()
        self.backbone = timm.create_model(CFG['MODEL_NAME_3'], pretrained=True)
        self.classifier = nn.Linear(1000, num_classes)
        # self.classifier = nn.Linear(21841, num_classes)
        
    def forward(self, x):
        x = self.backbone(x)
        x = F.sigmoid(self.classifier(x))
        return x
    
# class BaseModel_4(nn.Module):
#     def __init__(self, num_classes=10):
#         super(BaseModel_4, self).__init__()
#         self.backbone = timm.create_model(CFG['MODEL_NAME_4'], pretrained=True)
#         self.classifier = nn.Linear(1000, num_classes)
#         # self.classifier = nn.Linear(21841, num_classes)
        
#     def forward(self, x):
#         x = self.backbone(x)
#         x = F.sigmoid(self.classifier(x))
#         return x
    
train_transform = A.Compose([
    A.CenterCrop(CFG['IMG_SIZE'], CFG['IMG_SIZE']),
    A.Resize(CFG['TRAIN_IMAGE_SIZE'],CFG['TRAIN_IMAGE_SIZE']),
    A.Normalize(
        mean = (0.485, 0.456, 0.406), 
        std = (0.229, 0.224, 0.225), 
        max_pixel_value = 255.0, 
        always_apply = False, 
        p = 1.0),
    ToTensorV2()
])

test_transform = A.Compose([
    A.CenterCrop(CFG['IMG_SIZE'], CFG['IMG_SIZE']),
    A.Resize(CFG['TEST_IMAGE_SIZE'],CFG['TEST_IMAGE_SIZE']),
    A.Normalize(
        mean = (0.485, 0.456, 0.406), 
        std = (0.229, 0.224, 0.225), 
        max_pixel_value = 255.0, 
        always_apply = False, 
        p = 1.0),
    ToTensorV2()
])

train_dataset = CustomDataset(train['img_path'].values, train_labels, train_transform)
val_dataset = CustomDataset(val['img_path'].values, val_labels, test_transform)

def train(model, optimizer, train_loader, val_loader, scheduler, device):
    save_time = datetime.datetime.now().strftime("%H_%M_%S")
    model.to(device)
    criterion = nn.BCELoss().to(device)
    scaler = torch.cuda.amp.GradScaler()
    
    best_val_acc = 0
    best_model = None
    
    for epoch in range(1, CFG['EPOCHS']+1):
        model.train()
        train_loss = []
        for imgs, labels in tqdm(iter(train_loader)):
            imgs = imgs.float().to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            output = model(imgs)
            loss = criterion(output, labels)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            train_loss.append(loss.item())
                    
        _val_loss, _val_acc = validation(model, criterion, val_loader, device)
        _train_loss = np.mean(train_loss)
        print(f'Epoch [{epoch}], Train Loss : [{_train_loss:.5f}], Val Loss : [{_val_loss:.5f}], Val ACC : [{_val_acc:.5f}]')
        
        torch.save({'epoch': epoch,
                'state_dict': model.state_dict(),
                'optimizer': optimizer.state_dict(),
                'scaler': scaler.state_dict(),
         }, './pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date 
                   + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+ '_' + save_time +'_epoch_{}.pth'.format(epoch))
        print('-----------------SAVE:{} epoch----------------'.format(epoch))
        
        wandb.log({
                "Train Loss": _train_loss,
                "Val Loss": _val_loss,
                "Val ACC": _val_acc,
                "epoch": epoch
        })
        
        if scheduler is not None:
            scheduler.step(_val_acc)
            
        if best_val_acc < _val_acc:
            best_val_acc = _val_acc
            best_model = model
            print('-------------Best Epoch = {} epoch------------'.format(epoch))
    
    return best_model


def validation(model, criterion, val_loader, device):
    model.eval()
    val_loss = []
    val_acc = []
    with torch.no_grad():
        for imgs, labels in tqdm(iter(val_loader)):
            imgs = imgs.float().to(device)
            labels = labels.to(device)
            probs = model(imgs)
            loss = criterion(probs, labels)
            probs  = probs.cpu().detach().numpy()
            labels = labels.cpu().detach().numpy()
            preds = probs > CFG['THRESHOLD']
            batch_acc = (labels == preds).mean()
            
            val_acc.append(batch_acc)
            val_loss.append(loss.item())
        
        _val_loss = np.mean(val_loss)
        _val_acc = np.mean(val_acc)
    
    return _val_loss, _val_acc


model_0 = BaseModel_0()
model_0.eval()

model_1 = BaseModel_1()
model_1.eval()

model_2 = BaseModel_2()
model_2.eval()

model_3 = BaseModel_3()
model_3.eval()

# model_4 = BaseModel_4()
# model_4.eval()

optimizer_0 = torch.optim.AdamW(model_0.parameters(), lr = CFG['LEARNING_RATE'], weight_decay = CFG['WEIGHT_DECAY'])
optimizer_1 = torch.optim.AdamW(model_1.parameters(), lr = CFG['LEARNING_RATE'], weight_decay = CFG['WEIGHT_DECAY'])
optimizer_2 = torch.optim.AdamW(model_2.parameters(), lr = CFG['LEARNING_RATE'], weight_decay = CFG['WEIGHT_DECAY'])
optimizer_3 = torch.optim.AdamW(model_3.parameters(), lr = CFG['LEARNING_RATE'], weight_decay = CFG['WEIGHT_DECAY'])
# optimizer_4 = torch.optim.AdamW(model_4.parameters(), lr = CFG['LEARNING_RATE'], weight_decay = CFG['WEIGHT_DECAY'])

scheduler_0 = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer_0,
    mode = 'max',
    factor = 0.5,
    patience = 2,
    threshold_mode = 'abs',
    min_lr = 1e-6, 
    verbose = True
)

scheduler_1 = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer_1,
    mode = 'max',
    factor = 0.5,
    patience = 2,
    threshold_mode = 'abs',
    min_lr = 1e-6, 
    verbose = True
)

scheduler_2 = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer_2,
    mode = 'max',
    factor = 0.5,
    patience = 2,
    threshold_mode = 'abs',
    min_lr = 1e-6, 
    verbose = True
)

scheduler_3 = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer_3,
    mode = 'max',
    factor = 0.5,
    patience = 2,
    threshold_mode = 'abs',
    min_lr = 1e-6, 
    verbose = True
)

# scheduler_4 = torch.optim.lr_scheduler.ReduceLROnPlateau(
#     optimizer_4,
#     mode = 'max',
#     factor = 0.5,
#     patience = 2,
#     threshold_mode = 'abs',
#     min_lr = 1e-6, 
#     verbose = True
# )

def inference(model, test_loader, device):
    model.to(device)
    model.eval()
    predictions = []
    pred_ensemble_tensor = []
    with torch.no_grad():
        for imgs in tqdm(iter(test_loader)):
            imgs = imgs.float().to(device)
            probs = model(imgs)
            pred_ensemble_tensor.extend(probs.detach().cpu().numpy())
            probs  = probs.cpu().detach().numpy()
            preds = probs > CFG['THRESHOLD']
            preds = preds.astype(int)
            predictions += preds.tolist()
    return predictions, pred_ensemble_tensor

def ensemble_2(arr0, arr1):
    ensemble2arr = []
    en_pred = (np.array(arr0) + np.array(arr1))/2
    en_preds = en_pred > CFG['THRESHOLD']
    en_preds = en_preds.astype(int)
    ensemble2arr += en_preds.tolist()
    return ensemble2arr

def ensemble_3(arr0, arr1, arr2):
    ensemble2arr = []
    en_pred = (np.array(arr0) + np.array(arr1) + np.array(arr2))/3
    en_preds = en_pred > CFG['THRESHOLD']
    en_preds = en_preds.astype(int)
    ensemble2arr += en_preds.tolist()
    return ensemble2arr

def ensemble_4(arr0, arr1, arr2, arr3):
    ensemble2arr = []
    en_pred = (np.array(arr0) + np.array(arr1) + np.array(arr2) + np.array(arr3))/4
    en_preds = en_pred > CFG['THRESHOLD']
    en_preds = en_preds.astype(int)
    ensemble2arr += en_preds.tolist()
    return ensemble2arr

test_dataset = CustomDataset(test['img_path'].values, None, test_transform)

train_loader_0 = DataLoader(train_dataset, batch_size = CFG['BATCH_SIZE_0'], shuffle=True, num_workers=0)
val_loader_0 = DataLoader(val_dataset, batch_size = CFG['BATCH_SIZE_0'], shuffle=False, num_workers=0)
test_loader_0 = DataLoader(test_dataset, batch_size = CFG['BATCH_SIZE_0'], shuffle=False, num_workers=0)

infer_model_0 = train(model_0, optimizer_0, train_loader_0, val_loader_0, scheduler_0, device)
preds_0, preds_ensemble_0 = inference(model_0, test_loader_0, device)

submit.iloc[:,1:] = preds_0
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_' + CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+ '_' + train_date 
              + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+ '_' + train_date + '_preds_0_submit.csv', index=False)

# bot.sendMessage(chat_id = chat_id, text = CFG['MODEL_NAME_0'] + "코드 실행이 성공적으로 진행되었습니다.")

del model_0, train_loader_0, val_loader_0, test_loader_0
torch.cuda.empty_cache()

train_loader_1 = DataLoader(train_dataset, batch_size = CFG['BATCH_SIZE_1'], shuffle=True, num_workers=0)
val_loader_1 = DataLoader(val_dataset, batch_size = CFG['BATCH_SIZE_1'], shuffle=False, num_workers=0)
test_loader_1 = DataLoader(test_dataset, batch_size = CFG['BATCH_SIZE_1'], shuffle=False, num_workers=0)

infer_model_1 = train(model_1, optimizer_1, train_loader_1, val_loader_1, scheduler_1, device)
preds_1, preds_ensemble_1 = inference(model_1, test_loader_1, device)

submit.iloc[:,1:] = preds_1
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_' + CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+ '_' + train_date 
              + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3'] + '_' + train_date + '_preds_1_submit.csv', index=False)

del model_1, train_loader_1, val_loader_1, test_loader_1
torch.cuda.empty_cache()

train_loader_2 = DataLoader(train_dataset, batch_size = CFG['BATCH_SIZE_2'], shuffle=True, num_workers=0)
val_loader_2 = DataLoader(val_dataset, batch_size = CFG['BATCH_SIZE_2'], shuffle=False, num_workers=0)
test_loader_2 = DataLoader(test_dataset, batch_size = CFG['BATCH_SIZE_2'], shuffle=False, num_workers=0)

infer_model_2 = train(model_2, optimizer_2, train_loader_2, val_loader_2, scheduler_2, device)
preds_2, preds_ensemble_2 = inference(model_2, test_loader_2, device)

submit.iloc[:,1:] = preds_2
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+ '_' + train_date 
              + '/'+CFG['MODEL_NAME_0']+'_' + CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3'] + '_' + train_date + '_preds_2_submit.csv', index=False)

del model_2, train_loader_2, val_loader_2, test_loader_2
torch.cuda.empty_cache()

train_loader_3 = DataLoader(train_dataset, batch_size = CFG['BATCH_SIZE_3'], shuffle=True, num_workers=0)
val_loader_3 = DataLoader(val_dataset, batch_size = CFG['BATCH_SIZE_3'], shuffle=False, num_workers=0)
test_loader_3 = DataLoader(test_dataset, batch_size = CFG['BATCH_SIZE_3'], shuffle=False, num_workers=0)

infer_model_3 = train(model_3, optimizer_3, train_loader_3, val_loader_3, scheduler_3, device)
preds_3, preds_ensemble_3 = inference(model_3, test_loader_3, device)

submit.iloc[:,1:] = preds_3
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+ '_' + train_date 
              + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3'] + '_' + train_date + '_preds_3_submit.csv', index=False)

del model_3, train_loader_3, val_loader_3, test_loader_3
torch.cuda.empty_cache()

# train_loader_4 = DataLoader(train_dataset, batch_size = CFG['BATCH_SIZE_4'], shuffle=True, num_workers=0)
# val_loader_4 = DataLoader(val_dataset, batch_size = CFG['BATCH_SIZE_4'], shuffle=False, num_workers=0)
# test_loader_4 = DataLoader(test_dataset, batch_size = CFG['BATCH_SIZE_4'], shuffle=False, num_workers=0)

# infer_model_4 = train(model_4, optimizer_4, train_loader_4, val_loader_4, scheduler_4, device)
# preds_4, preds_ensemble_4 = inference(model_4, test_loader_4, device)

# submit.iloc[:,1:] = preds_4
# submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_'+CFG['MODEL_NAME_4']+ '_' + train_date 
#               + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_'+CFG['MODEL_NAME_4'] + '_' + train_date + '_preds_4_submit.csv', index=False)

print('preds_ensemble_0: ', preds_ensemble_0)
print('preds_ensemble_1: ', preds_ensemble_1)
print('preds_ensemble_2: ', preds_ensemble_2)
print('preds_ensemble_3: ', preds_ensemble_3)
# print('preds_ensemble_4: ', preds_ensemble_4)

ensemble_2_preds = ensemble_2(preds_ensemble_1, preds_ensemble_2)

print('ensemble_2_preds: ', ensemble_2_preds)

submit.iloc[:,1:] = ensemble_2_preds
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date 
              + '/' + CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_' + train_date + '_preds_ensemble_2_submit.csv', index=False)

ensemble_3_preds_1 = ensemble_3(preds_ensemble_0, preds_ensemble_1, preds_ensemble_2)

print('ensemble_3_preds_1: ', ensemble_3_preds_1)

submit.iloc[:,1:] = ensemble_3_preds_1
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date 
              + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_' + train_date + '_preds_ensemble_3_1_submit.csv', index=False)

ensemble_3_preds_2 = ensemble_3(preds_ensemble_1, preds_ensemble_2, preds_ensemble_3)

print('ensemble_3_preds_2: ', ensemble_3_preds_2)

submit.iloc[:,1:] = ensemble_3_preds_2
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date 
              + '/'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date + '_preds_ensemble_3_2_submit.csv', index=False)

ensemble_4_preds = ensemble_4(preds_ensemble_0, preds_ensemble_1, preds_ensemble_2, preds_ensemble_3)

print('ensemble_4_preds: ', ensemble_4_preds)

submit.iloc[:,1:] = ensemble_4_preds
submit.to_csv('./pth/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date 
              + '/' +CFG['MODEL_NAME_0']+'_'+ CFG['MODEL_NAME_1']+'_'+CFG['MODEL_NAME_2']+'_'+CFG['MODEL_NAME_3']+'_' + train_date + '_preds_ensemble_4_submit.csv', index=False)
