import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import FarmerLayout from './FarmerLayout'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Select from '../../components/Select/Select'
import Stepper from '../../components/Stepper/Stepper'
import TrustBadge from '../../components/TrustBadge/TrustBadge'
import { cx } from '../../lib/cx'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { uploadLotImage } from '../../services/supabase/lots'
import { validateImageFile } from '../../services/cloudinary'
import { CROPS, CROP_VARIETIES, MANDIS, CROP_MARKET_DATA } from '../../data/mockPrices'
import type { Grade, PaymentMode } from '../../types'
import styles from './FarmerCreateLot.module.css'

const STEPS = ['Crop & grade', 'Quantity', 'Price & payment', 'Review']
const GRADES: Array<{ value: Grade; label: string }> = [
  { value: 'A', label: 'Grade A — Premium' },
  { value: 'B', label: 'Grade B — Standard' },
  { value: 'C', label: 'Grade C — Economy' },
]

interface WizardData {
  cropId: string
  variety: string
  grade: Grade | ''
  mandi: string
  images: File[]
  imagePreviews: string[]
  quantity: string
  expectedPrice: string
  paymentMode: PaymentMode
  assaying: boolean
}

interface StepErrors {
  cropId?: string
  variety?: string
  grade?: string
  mandi?: string
  quantity?: string
  expectedPrice?: string
}

export default function FarmerCreateLot() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { createLot } = useApp()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [uploadLabel, setUploadLabel] = useState('')
  const [errors, setErrors] = useState<StepErrors>({})

  const prefilledCrop = searchParams.get('crop') ?? ''

  const [data, setData] = useState<WizardData>({
    cropId: prefilledCrop,
    variety: '',
    grade: '',
    mandi: '',
    images: [],
    imagePreviews: [],
    quantity: '',
    expectedPrice: '',
    paymentMode: 'escrow',
    assaying: false,
  })

  useEffect(() => {
    const previews = data.imagePreviews
    return () => { previews.forEach(url => URL.revokeObjectURL(url)) }
  }, [])

  const marketData = CROP_MARKET_DATA.find(c => c.id === data.cropId)
  const varietyOptions = data.cropId ? (CROP_VARIETIES[data.cropId] ?? []) : []

  const update = useCallback(<K extends keyof WizardData>(key: K, val: WizardData[K]) => {
    setData(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  function handleCropChange(cropId: string) {
    setData(prev => ({ ...prev, cropId, variety: '', grade: '' }))
    setErrors(prev => ({ ...prev, cropId: undefined, variety: undefined }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    if (!incoming.length) return

    const valid: File[] = []
    for (const file of incoming) {
      try {
        validateImageFile(file)
        valid.push(file)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Invalid file')
      }
    }
    if (!valid.length) { e.target.value = ''; return }

    const merged = [...data.images, ...valid].slice(0, 5)
    const newPreviews = merged.map((f, i) =>
      i < data.images.length ? data.imagePreviews[i] : URL.createObjectURL(f)
    )
    setData(prev => ({ ...prev, images: merged, imagePreviews: newPreviews }))
    e.target.value = ''
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(data.imagePreviews[idx])
    setData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== idx),
    }))
  }

  function validateStep(s: number): StepErrors {
    const errs: StepErrors = {}
    if (s === 0) {
      if (!data.cropId) errs.cropId = 'Select a crop'
      if (!data.variety) errs.variety = 'Select a variety'
      if (!data.grade) errs.grade = 'Select a grade'
      if (!data.mandi) errs.mandi = 'Select a mandi'
    }
    if (s === 1) {
      const qty = parseFloat(data.quantity)
      if (!data.quantity || isNaN(qty) || qty <= 0) errs.quantity = 'Enter a valid quantity greater than 0'
      else if (qty > 10000) errs.quantity = 'Quantity cannot exceed 10,000 quintal'
    }
    if (s === 2) {
      const price = parseFloat(data.expectedPrice)
      if (!data.expectedPrice || isNaN(price) || price <= 0)
        errs.expectedPrice = 'Enter a valid price greater than 0'
    }
    return errs
  }

  function handleNext() {
    const errs = validateStep(step)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
  }

  function handleBack() {
    setErrors({})
    setStep(s => s - 1)
  }

  async function handleSaveDraft() {
    try {
      await createLot({
        cropId: data.cropId || 'wheat',
        crop: CROPS.find(c => c.id === data.cropId)?.label ?? data.cropId,
        variety: data.variety || 'Unknown',
        grade: (data.grade as Grade) || 'B',
        quantity: parseFloat(data.quantity) || 0,
        unit: 'quintal',
        expectedPrice: parseFloat(data.expectedPrice) || 0,
        paymentMode: data.paymentMode,
        assaying: data.assaying,
        mandi: data.mandi || 'Nashik APMC',
        imagePreviews: [],
        status: 'draft',
        sellingMethod: 'direct',
      })
      toast.success('Draft saved')
      navigate('/farmer/lots')
    } catch {
      toast.error('Failed to save draft')
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const lot = await createLot({
        cropId: data.cropId,
        crop: CROPS.find(c => c.id === data.cropId)?.label ?? data.cropId,
        variety: data.variety,
        grade: data.grade as Grade,
        quantity: parseFloat(data.quantity),
        unit: 'quintal',
        expectedPrice: parseFloat(data.expectedPrice),
        paymentMode: data.paymentMode,
        assaying: data.assaying,
        mandi: data.mandi,
        imagePreviews: [],
        status: 'listed',
        sellingMethod: 'direct',
      })

      // Upload images to Cloudinary after lot creation (non-fatal if any fail)
      if (data.images.length > 0 && user) {
        const uploadedUrls: string[] = []
        for (let i = 0; i < data.images.length; i++) {
          const file = data.images[i]
          try {
            setUploadLabel(`Uploading photo ${i + 1} of ${data.images.length}…`)
            const url = await uploadLotImage(user.id, lot.id, file, (pct) => {
              setUploadLabel(`Photo ${i + 1}/${data.images.length} — ${pct}%`)
            })
            uploadedUrls.push(url)
          } catch {
            // Image upload failure is non-fatal — lot is already created
          }
        }
        setUploadLabel('')
        if (uploadedUrls.length > 0) {
          const { supabase: sb } = await import('../../lib/supabase')
          await sb.from('lots').update({ image_urls: uploadedUrls }).eq('id', lot.id)
        }
      }

      toast.success('Lot listed successfully!')
      navigate('/farmer/lots')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to list lot')
    } finally {
      setSubmitting(false)
    }
  }

  const qty = parseFloat(data.quantity) || 0
  const price = parseFloat(data.expectedPrice) || 0
  const estimatedValue = qty * price
  const assayingFee = data.assaying ? qty * 40 : 0
  const cropName = CROPS.find(c => c.id === data.cropId)?.label ?? '—'

  return (
    <FarmerLayout>
      <div className={styles.page}>
        <div className={styles.stepperWrap}>
          <Stepper steps={STEPS} currentStep={step} />
          <p className={styles.stepCounter}>Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Step 0: Crop & grade */}
        {step === 0 && (
          <Card className={styles.formCard}>
            <h2 className={styles.stepHeading}>Crop &amp; grade</h2>
            <div className={styles.formGrid}>
              <Select id="crop" label="Crop" value={data.cropId}
                onChange={e => handleCropChange(e.target.value)}
                options={CROPS.map(c => ({ value: c.id, label: c.label }))}
                placeholder="Select crop" error={errors.cropId}
              />
              <Select id="variety" label="Variety" value={data.variety}
                onChange={e => update('variety', e.target.value)}
                options={varietyOptions.map(v => ({ value: v, label: v }))}
                placeholder={data.cropId ? 'Select variety' : 'Select a crop first'}
                disabled={!data.cropId} error={errors.variety}
              />
              <Select id="grade" label="Grade" value={data.grade}
                onChange={e => update('grade', e.target.value as Grade)}
                options={GRADES} placeholder="Select grade" error={errors.grade}
              />
              <Select id="mandi" label="Mandi" value={data.mandi}
                onChange={e => update('mandi', e.target.value)}
                options={MANDIS.map(m => ({ value: m, label: m }))}
                placeholder="Select mandi" error={errors.mandi}
              />
            </div>

            <div className={styles.imageSection}>
              <p className={styles.imageLabel}>Produce photos (optional, max 5)</p>
              <div className={styles.imageRow}>
                {data.imagePreviews.map((src, i) => (
                  <div key={i} className={styles.thumb}>
                    <img src={src} alt={`Produce photo ${i + 1}`} className={styles.thumbImg} />
                    <button type="button" className={styles.thumbRemove} onClick={() => removeImage(i)} aria-label={`Remove photo ${i + 1}`}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {data.images.length < 5 && (
                  <button type="button" className={styles.addImageBtn} onClick={() => fileInputRef.current?.click()} aria-label="Add produce photos">
                    <ImagePlus size={20} className={styles.addImageIcon} />
                    <span>Add photo</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                className={styles.hiddenInput} onChange={handleImageChange}
                aria-hidden="true" tabIndex={-1}
              />
            </div>
          </Card>
        )}

        {/* Step 1: Quantity */}
        {step === 1 && (
          <Card className={styles.formCard}>
            <h2 className={styles.stepHeading}>Quantity</h2>
            <div className={styles.formSingle}>
              <Input id="quantity" label="Quantity (quintal)" type="number" min="0" step="0.1"
                value={data.quantity} onChange={e => update('quantity', e.target.value)}
                placeholder="0" helperText="Enter the quantity in quintal you want to list"
                error={errors.quantity}
              />
            </div>
            {qty > 0 && marketData && (
              <div className={styles.calcPreview}>
                <p className={styles.calcLabel}>Estimated value at today's mandi price</p>
                <p className={styles.calcValue} data-numeric="">₹{(qty * marketData.currentPrice).toLocaleString('en-IN')}</p>
                <p className={styles.calcNote}>Based on ₹{marketData.currentPrice.toLocaleString('en-IN')}/qtl at {marketData.mandi}</p>
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Price & payment */}
        {step === 2 && (
          <Card className={styles.formCard}>
            <h2 className={styles.stepHeading}>Price &amp; payment</h2>
            <div className={styles.formSingle}>
              <Input id="expectedPrice" label="Expected price (₹ per quintal)" type="number" min="0" step="1"
                value={data.expectedPrice} onChange={e => update('expectedPrice', e.target.value)}
                placeholder="0"
                helperText={marketData
                  ? `Today's mandi price: ₹${marketData.currentPrice.toLocaleString('en-IN')}/qtl · MSP: ₹${marketData.msp.toLocaleString('en-IN')}/qtl`
                  : 'Enter your expected price per quintal'}
                error={errors.expectedPrice}
              />
            </div>

            <div className={styles.paymentSection}>
              <p className={styles.paymentLabel}>Payment mode</p>
              <div className={styles.radioGroup} role="radiogroup">
                <label className={cx(styles.radioOption, data.paymentMode === 'escrow' ? styles.radioSelected : undefined)}>
                  <input type="radio" name="paymentMode" value="escrow"
                    checked={data.paymentMode === 'escrow'} onChange={() => update('paymentMode', 'escrow')}
                    className={styles.radioInput}
                  />
                  <div>
                    <p className={styles.radioTitle}>Escrow (recommended)</p>
                    <p className={styles.radioDesc}>Payment held securely until weight is confirmed at delivery</p>
                  </div>
                </label>
                <label className={cx(styles.radioOption, data.paymentMode === 'direct' ? styles.radioSelected : undefined)}>
                  <input type="radio" name="paymentMode" value="direct"
                    checked={data.paymentMode === 'direct'} onChange={() => update('paymentMode', 'direct')}
                    className={styles.radioInput}
                  />
                  <div>
                    <p className={styles.radioTitle}>Direct bank transfer</p>
                    <p className={styles.radioDesc}>Buyer pays directly after delivery confirmation</p>
                  </div>
                </label>
              </div>
              <p className={styles.paymentInfo}>Payment terms will be finalised when a buyer is matched.</p>
            </div>

            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={data.assaying}
                onChange={e => update('assaying', e.target.checked)} className={styles.checkbox}
              />
              <div>
                <p className={styles.checkboxTitle}>Lab assaying at mandi gate</p>
                <p className={styles.checkboxDesc}>₹40/qtl fee · Independent quality verification that can increase your realised price</p>
              </div>
            </label>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card className={cx(styles.formCard, styles.reviewCard)}>
            <h2 className={styles.stepHeading}>Review your lot</h2>
            <div className={styles.reviewRows}>
              <ReviewRow label="Crop" value={cropName} />
              <ReviewRow label="Variety" value={data.variety} />
              <ReviewRow label="Grade" value={`Grade ${data.grade}`} />
              <ReviewRow label="Mandi" value={data.mandi} />
              <ReviewRow label="Quantity" value={`${data.quantity} quintal`} numeric />
              <ReviewRow label="Expected price" value={`₹${parseFloat(data.expectedPrice).toLocaleString('en-IN')}/qtl`} numeric />
              <div className={styles.reviewRow}>
                <span className={styles.reviewKey}>Est. total value</span>
                <span className={cx(styles.reviewVal, styles.reviewTotal)} data-numeric="">₹{estimatedValue.toLocaleString('en-IN')}</span>
              </div>
              <ReviewRow label="Payment mode" value={data.paymentMode === 'escrow' ? 'Escrow' : 'Direct bank transfer'} />
              <ReviewRow label="Lab assaying" value={data.assaying ? `Yes — ₹${assayingFee.toLocaleString('en-IN')} total fee` : 'No'} />
              {data.imagePreviews.length > 0 && (
                <div className={styles.reviewRow}>
                  <span className={styles.reviewKey}>Photos</span>
                  <div className={styles.reviewThumbs}>
                    {data.imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt={`Photo ${i + 1}`} className={styles.reviewThumb} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.trustRow}>
              <TrustBadge type="escrow" />
              <TrustBadge type="verified-farmer" />
              <TrustBadge type="price-source" />
              {data.assaying && <TrustBadge type="assayed" />}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className={styles.navRow}>
          {step > 0 && (
            <Button variant="secondary" size="md" onClick={handleBack} disabled={submitting}>Back</Button>
          )}
          <div className={styles.navRight}>
            {step < STEPS.length - 1 ? (
              <>
                <Button variant="secondary" size="sm" onClick={handleSaveDraft}>Save as draft</Button>
                <Button variant="primary" size="md" onClick={handleNext}>Next</Button>
              </>
            ) : (
              <div className={styles.submitWrap}>
                {qty > 0 && price > 0 && (
                  <p className={styles.submitSummary}>
                    {data.quantity} qtl of {cropName} at ₹{parseFloat(data.expectedPrice).toLocaleString('en-IN')}/qtl
                  </p>
                )}
                <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitting} className={styles.submitBtn}>
                  {submitting ? (uploadLabel || 'Creating lot…') : 'List this lot'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </FarmerLayout>
  )
}

function ReviewRow({ label, value, numeric }: { label: string; value: string; numeric?: boolean }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewKey}>{label}</span>
      <span className={styles.reviewVal} {...(numeric ? { 'data-numeric': '' } : {})}>{value}</span>
    </div>
  )
}
