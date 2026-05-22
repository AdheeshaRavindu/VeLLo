from app.services.help_model_service import _load_model, classify_help_model

def main():
    m = _load_model()
    print('model loaded:', m is not None)
    res = classify_help_model(None, None)
    print('classify_help_model returned:', res.intent, res.confidence)

if __name__ == '__main__':
    main()
